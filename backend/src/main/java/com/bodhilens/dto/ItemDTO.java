package com.bodhilens.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ItemDTO {
    private Long id;
    private String customName;
    private String material;
    private String period;
    private BigDecimal lengthCm;
    private BigDecimal widthCm;
    private BigDecimal heightCm;
    private String source;
    private String sourceNotes;
    private String remarks;
    private java.math.BigDecimal price;
    private String currency;
    private Boolean isOwned;
    private List<String> provenance;
    private List<AttachmentDTO> attachments;
    private ItemImageDTO mainImage;
    private List<ItemImageDTO> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
