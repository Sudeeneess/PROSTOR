package com.prostor.prostorApp.modules.product.service;


import com.prostor.prostorApp.modules.product.dto.SizeRequest;
import com.prostor.prostorApp.modules.product.dto.SizeResponse;
import com.prostor.prostorApp.modules.product.model.Size;
import com.prostor.prostorApp.modules.product.repository.SizeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SizeService {

    private final SizeRepository sizeRepository;

    private SizeResponse toResponse(Size size) {
        if (size == null) return null;
        SizeResponse response = new SizeResponse();
        response.setId(size.getId());
        response.setName(size.getName());
        return response;
    }

    private Size toEntity(SizeRequest request) {
        if (request == null) return null;
        Size size = new Size();
        size.setName(request.getName());
        return size;
    }

    private void updateEntity(Size size, SizeRequest request) {
        if (request == null) return;
        size.setName(request.getName());
    }

    public Page<SizeResponse> getAll(Pageable pageable) {
        return sizeRepository.findAll(pageable).map(this::toResponse);
    }

    public SizeResponse getById(Integer id) {
        return sizeRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));
    }

    @Transactional
    public SizeResponse create(SizeRequest request) {

        if (sizeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Size with name '" + request.getName() + "' already exists");
        }
        Size size = toEntity(request);
        Size saved = sizeRepository.save(size);
        return toResponse(saved);
    }


    @Transactional
    public SizeResponse update(Integer id, SizeRequest request) {
        Size existing = sizeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));


        if (!existing.getName().equals(request.getName()) && sizeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Size with name '" + request.getName() + "' already exists");
        }

        updateEntity(existing, request);
        Size updated = sizeRepository.save(existing);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!sizeRepository.existsById(id)) {
            throw new EntityNotFoundException("Size not found with id: " + id);
        }
        sizeRepository.deleteById(id);
    }
}
