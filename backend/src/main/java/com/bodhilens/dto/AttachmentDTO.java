package com.bodhilens.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttachmentDTO {
    private Long id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private String url;
}
