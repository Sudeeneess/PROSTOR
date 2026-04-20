package com.prostor.prostorApp.modules.warehouse.service;

import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionDetailsResponse;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionListResponse;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionProductResponse;
import com.prostor.prostorApp.modules.warehouse.model.GoodsReception;
import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.repository.GoodsReceptionRepository;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionListRow;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionProductRow;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoodsReceptionService {

    private final GoodsReceptionRepository goodsReceptionRepository;

    public List<GoodsReceptionListResponse> getForWarehouse(
            ReceptionStatus status,
            Integer sellerId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        return goodsReceptionRepository.findForWarehouseList(status, sellerId, fromDate, toDate)
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    public GoodsReceptionDetailsResponse getDetails(Integer receptionId) {
        GoodsReception reception = goodsReceptionRepository.findById(receptionId)
                .orElseThrow(() -> new EntityNotFoundException("Приемка не найдена с идентификатором: " + receptionId));

        List<GoodsReceptionProductResponse> products = goodsReceptionRepository.findReceptionProductsWithStock(receptionId)
                .stream()
                .map(this::toProductResponse)
                .toList();

        GoodsReceptionDetailsResponse response = new GoodsReceptionDetailsResponse();
        response.setId(reception.getId());
        response.setSellerId(reception.getSeller().getId());
        response.setSellerCompanyName(reception.getSeller().getCompanyName());
        response.setStatus(reception.getStatus());
        response.setCreatedAt(reception.getCreatedAt());
        response.setAcceptedAt(reception.getAcceptedAt());
        response.setAcceptedByWarehouseManagerId(
                reception.getAcceptedByWarehouseManager() != null ? reception.getAcceptedByWarehouseManager().getId() : null
        );
        response.setPositionsCount(products.size());
        response.setProducts(products);
        return response;
    }

    @Transactional
    public GoodsReceptionDetailsResponse acceptReception(Integer receptionId, WarehouseManager warehouseManager) {
        GoodsReception reception = goodsReceptionRepository.findById(receptionId)
                .orElseThrow(() -> new EntityNotFoundException("Приемка не найдена с идентификатором: " + receptionId));

        if (reception.getStatus() == ReceptionStatus.ACCEPTED) {
            return getDetails(reception.getId());
        }

        reception.setStatus(ReceptionStatus.ACCEPTED);
        reception.setAcceptedAt(LocalDateTime.now());
        reception.setAcceptedByWarehouseManager(warehouseManager);

        GoodsReception saved = goodsReceptionRepository.save(reception);
        log.info("Goods reception {} accepted by warehouse manager {}", saved.getId(), warehouseManager.getId());
        return getDetails(saved.getId());
    }

    @Transactional
    public GoodsReception getOrCreatePendingReception(Seller seller) {
        return goodsReceptionRepository.findFirstBySellerIdAndStatusOrderByCreatedAtDesc(seller.getId(), ReceptionStatus.PENDING)
                .orElseGet(() -> createPendingReception(seller));
    }

    @Transactional
    public GoodsReception getOrCreateAcceptedReception(Seller seller) {
        return goodsReceptionRepository.findFirstBySellerIdAndStatusOrderByCreatedAtDesc(seller.getId(), ReceptionStatus.ACCEPTED)
                .orElseGet(() -> createAcceptedReception(seller));
    }

    private GoodsReceptionListResponse toListResponse(GoodsReceptionListRow row) {
        GoodsReceptionListResponse response = new GoodsReceptionListResponse();
        response.setId(row.getId());
        response.setSellerId(row.getSellerId());
        response.setSellerCompanyName(row.getSellerCompanyName());
        response.setStatus(row.getStatus());
        response.setCreatedAt(row.getCreatedAt());
        response.setAcceptedAt(row.getAcceptedAt());
        response.setAcceptedByWarehouseManagerId(row.getAcceptedByWarehouseManagerId());
        response.setPositionsCount(row.getPositionsCount() != null ? row.getPositionsCount() : 0);
        return response;
    }

    private GoodsReceptionProductResponse toProductResponse(GoodsReceptionProductRow row) {
        GoodsReceptionProductResponse response = new GoodsReceptionProductResponse();
        response.setProductId(row.getProductId());
        response.setProductName(row.getProductName());
        response.setQuantityOnWarehouse(row.getQuantityOnWarehouse() != null ? row.getQuantityOnWarehouse() : 0);
        return response;
    }

    private GoodsReception createPendingReception(Seller seller) {
        try {
            GoodsReception reception = new GoodsReception();
            reception.setSeller(seller);
            reception.setStatus(ReceptionStatus.PENDING);
            reception.setCreatedAt(LocalDateTime.now());
            return goodsReceptionRepository.save(reception);
        } catch (DataIntegrityViolationException ex) {
            return goodsReceptionRepository.findFirstBySellerIdAndStatusOrderByCreatedAtDesc(seller.getId(), ReceptionStatus.PENDING)
                    .orElseThrow(() -> ex);
        }
    }

    private GoodsReception createAcceptedReception(Seller seller) {
        GoodsReception reception = new GoodsReception();
        reception.setSeller(seller);
        reception.setStatus(ReceptionStatus.ACCEPTED);
        reception.setCreatedAt(LocalDateTime.now());
        reception.setAcceptedAt(LocalDateTime.now());
        return goodsReceptionRepository.save(reception);
    }
}
