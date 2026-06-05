package com.bodhilens.dto;

import com.bodhilens.model.Material;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ItemRequest {
    private String customName;
    private Material material;
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
    private List<Long> attachmentIds;
    private List<Long> imageIds;
    private Long mainImageId;
}
