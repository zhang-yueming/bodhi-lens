package com.bodhilens.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImageUploadResponse {
    private Long id;
    private String url;
    private String s3Key;
}
