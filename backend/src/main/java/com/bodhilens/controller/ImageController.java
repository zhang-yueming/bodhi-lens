package com.bodhilens.controller;

import com.bodhilens.dto.ImageUploadResponse;
import com.bodhilens.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ItemService itemService;

    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(itemService.uploadImage(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
