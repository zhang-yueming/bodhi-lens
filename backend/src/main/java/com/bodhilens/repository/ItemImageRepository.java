package com.bodhilens.repository;

import com.bodhilens.model.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByItemIdOrderBySortOrderAsc(Long itemId);
    void deleteByItemId(Long itemId);
}
