package com.bodhilens.service;

import com.bodhilens.dto.*;
import com.bodhilens.model.*;
import com.bodhilens.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Sort;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemImageRepository imageRepository;
    private final ProvenanceRepository provenanceRepository;
    private final ItemAttachmentRepository attachmentRepository;
    private final S3Service s3Service;

    // ── Read ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ItemDTO> findAll(Material material, String period, String source) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (material != null) predicates.add(cb.equal(root.get("material"), material));
            if (period != null && !period.isBlank())
                predicates.add(cb.like(root.get("period"), "%" + period + "%"));
            if (source != null && !source.isBlank())
                predicates.add(cb.like(root.get("source"), "%" + source + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return itemRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt"))
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItemDTO findById(Long id) {
        return itemRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
    }

    // ── Write ───────────────────────────────────────────────────────────────

    @Transactional
    public ItemDTO create(ItemRequest request) {
        Item item = Item.builder()
                .customName(request.getCustomName())
                .material(request.getMaterial())
                .period(request.getPeriod())
                .lengthCm(request.getLengthCm())
                .widthCm(request.getWidthCm())
                .heightCm(request.getHeightCm())
                .source(request.getSource())
                .sourceNotes(request.getSourceNotes())
                .remarks(request.getRemarks())
                .price(request.getPrice())
                .currency(request.getCurrency())
                .isOwned(request.getIsOwned() != null ? request.getIsOwned() : false)
                .build();
        item = itemRepository.save(item);
        saveProvenance(item.getId(), request.getProvenance());
        linkAttachments(item.getId(), request.getAttachmentIds());
        attachImages(item, request.getImageIds(), request.getMainImageId());
        return toDTO(item);
    }

    @Transactional
    public ItemDTO update(Long id, ItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));

        item.setCustomName(request.getCustomName());
        item.setMaterial(request.getMaterial());
        item.setPeriod(request.getPeriod());
        item.setLengthCm(request.getLengthCm());
        item.setWidthCm(request.getWidthCm());
        item.setHeightCm(request.getHeightCm());
        item.setSource(request.getSource());
        item.setSourceNotes(request.getSourceNotes());
        item.setRemarks(request.getRemarks());
        item.setPrice(request.getPrice());
        item.setCurrency(request.getCurrency());
        item.setIsOwned(request.getIsOwned() != null ? request.getIsOwned() : item.getIsOwned());
        itemRepository.save(item);

        // Provenance: replace all
        provenanceRepository.deleteAllByItemId(id);
        saveProvenance(id, request.getProvenance());

        // Attachments: delete removed, keep/link remaining
        List<Long> newAttIds = request.getAttachmentIds() != null ? request.getAttachmentIds() : List.of();
        Set<Long> newAttSet = Set.copyOf(newAttIds);
        attachmentRepository.findByItemIdOrderByCreatedAtAsc(id).stream()
                .filter(a -> !newAttSet.contains(a.getId()))
                .forEach(a -> { s3Service.delete(a.getS3Key()); attachmentRepository.delete(a); });
        linkAttachments(id, newAttIds);

        // Images: delete removed, attach remaining
        List<Long> newImageIds = request.getImageIds() != null ? request.getImageIds() : List.of();
        Set<Long> newImgSet = Set.copyOf(newImageIds);
        imageRepository.findByItemIdOrderBySortOrderAsc(id).stream()
                .filter(img -> !newImgSet.contains(img.getId()))
                .forEach(img -> { s3Service.delete(img.getS3Key()); imageRepository.delete(img); });
        attachImages(item, newImageIds, request.getMainImageId());

        return toDTO(item);
    }

    @Transactional
    public void delete(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
        imageRepository.findByItemIdOrderBySortOrderAsc(id)
                .forEach(img -> s3Service.delete(img.getS3Key()));
        attachmentRepository.findByItemIdOrderByCreatedAtAsc(id)
                .forEach(a -> s3Service.delete(a.getS3Key()));
        itemRepository.delete(item);
    }

    // ── Image upload/delete ─────────────────────────────────────────────────

    public ImageUploadResponse uploadImage(MultipartFile file) {
        String key = s3Service.upload(file);
        ItemImage image = ItemImage.builder().s3Key(key).isMain(false).sortOrder(0).build();
        image = imageRepository.save(image);
        return ImageUploadResponse.builder()
                .id(image.getId()).url(s3Service.buildUrl(key)).s3Key(key).build();
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ItemImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));
        s3Service.delete(image.getS3Key());
        imageRepository.delete(image);
    }

    // ── Attachment upload/delete ────────────────────────────────────────────

    public AttachmentDTO uploadAttachment(MultipartFile file) {
        String key = s3Service.upload(file, "attachments/");
        ItemAttachment att = ItemAttachment.builder()
                .s3Key(key)
                .filename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();
        att = attachmentRepository.save(att);
        return toAttachmentDTO(att);
    }

    @Transactional
    public void deleteAttachment(Long id) {
        ItemAttachment att = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found: " + id));
        s3Service.delete(att.getS3Key());
        attachmentRepository.delete(att);
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private void saveProvenance(Long itemId, List<String> entries) {
        if (entries == null || entries.isEmpty()) return;
        List<Provenance> records = IntStream.range(0, entries.size())
                .filter(i -> entries.get(i) != null && !entries.get(i).isBlank())
                .mapToObj(i -> Provenance.builder()
                        .itemId(itemId).text(entries.get(i).strip()).sortOrder(i).build())
                .collect(Collectors.toList());
        provenanceRepository.saveAll(records);
    }

    private void linkAttachments(Long itemId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        attachmentRepository.findAllById(ids).forEach(a -> {
            a.setItemId(itemId);
            attachmentRepository.save(a);
        });
    }

    private void attachImages(Item item, List<Long> imageIds, Long mainImageId) {
        if (imageIds == null || imageIds.isEmpty()) return;
        for (int i = 0; i < imageIds.size(); i++) {
            final int index = i;
            final Long imgId = imageIds.get(i);
            imageRepository.findById(imgId).ifPresent(img -> {
                img.setItem(item);
                img.setMain(imgId.equals(mainImageId));
                img.setSortOrder(index);
                imageRepository.save(img);
            });
        }
    }

    private AttachmentDTO toAttachmentDTO(ItemAttachment a) {
        return AttachmentDTO.builder()
                .id(a.getId())
                .filename(a.getFilename())
                .contentType(a.getContentType())
                .fileSize(a.getFileSize())
                .url(s3Service.buildUrl(a.getS3Key()))
                .build();
    }

    private ItemDTO toDTO(Item item) {
        List<String> provenance = provenanceRepository
                .findByItemIdOrderBySortOrderAsc(item.getId())
                .stream().map(Provenance::getText).collect(Collectors.toList());

        List<AttachmentDTO> attachments = attachmentRepository
                .findByItemIdOrderByCreatedAtAsc(item.getId())
                .stream().map(this::toAttachmentDTO).collect(Collectors.toList());

        List<ItemImageDTO> imageDTOs = imageRepository
                .findByItemIdOrderBySortOrderAsc(item.getId()).stream()
                .map(img -> ItemImageDTO.builder()
                        .id(img.getId()).url(s3Service.buildUrl(img.getS3Key()))
                        .isMain(img.isMain()).sortOrder(img.getSortOrder()).build())
                .collect(Collectors.toList());

        ItemImageDTO mainImage = imageDTOs.stream().filter(ItemImageDTO::isMain).findFirst()
                .orElse(imageDTOs.isEmpty() ? null : imageDTOs.get(0));

        return ItemDTO.builder()
                .id(item.getId())
                .customName(item.getCustomName())
                .material(item.getMaterial() != null ? item.getMaterial().name() : null)
                .period(item.getPeriod())
                .lengthCm(item.getLengthCm())
                .widthCm(item.getWidthCm())
                .heightCm(item.getHeightCm())
                .source(item.getSource())
                .sourceNotes(item.getSourceNotes())
                .remarks(item.getRemarks())
                .price(item.getPrice())
                .currency(item.getCurrency())
                .isOwned(item.getIsOwned())
                .provenance(provenance)
                .attachments(attachments)
                .mainImage(mainImage)
                .images(imageDTOs)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
