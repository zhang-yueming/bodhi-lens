package com.bodhilens.repository;

import com.bodhilens.model.ItemAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemAttachmentRepository extends JpaRepository<ItemAttachment, Long> {
    List<ItemAttachment> findByItemIdOrderByCreatedAtAsc(Long itemId);
}
