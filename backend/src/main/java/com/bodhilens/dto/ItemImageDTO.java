package com.bodhilens.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ItemImageDTO {
    private Long id;
    private String url;
    private boolean isMain;
    private int sortOrder;
}
