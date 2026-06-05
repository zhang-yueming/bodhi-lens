package com.bodhilens.controller;

import com.bodhilens.dto.AttachmentDTO;
import com.bodhilens.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final ItemService itemService;

    @PostMapping("/upload")
    public ResponseEntity<AttachmentDTO> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(itemService.uploadAttachment(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
