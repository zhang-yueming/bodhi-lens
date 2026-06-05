package com.bodhilens.controller;

import com.bodhilens.dto.ItemDTO;
import com.bodhilens.dto.ItemRequest;
import com.bodhilens.model.Material;
import com.bodhilens.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public List<ItemDTO> list(
            @RequestParam(required = false) Material material,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String source) {
        return itemService.findAll(material, period, source);
    }

    @GetMapping("/{id}")
    public ItemDTO get(@PathVariable Long id) {
        return itemService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ItemDTO> create(@RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> update(@PathVariable Long id, @RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
