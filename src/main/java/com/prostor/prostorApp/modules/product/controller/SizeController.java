package com.prostor.prostorApp.modules.product.controller;


import com.prostor.prostorApp.modules.product.dto.SizeRequest;
import com.prostor.prostorApp.modules.product.dto.SizeResponse;
import com.prostor.prostorApp.modules.product.service.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sizes")
@RequiredArgsConstructor
public class SizeController {

    private final SizeService sizeService;

    @GetMapping
    public ResponseEntity<Page<SizeResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(sizeService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SizeResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(sizeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SizeResponse> create(@Valid @RequestBody SizeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sizeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SizeResponse> update(@PathVariable Integer id, @Valid @RequestBody SizeRequest request) {
        return ResponseEntity.ok(sizeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        sizeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
