package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.SellerOrdersDashboardResponse;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerOrdersDashboardService {

    private static final Set<String> ASSEMBLING_STATUSES = Set.of("PENDING", "CONFIRMED");
    private static final Set<String> ON_THE_WAY_STATUSES = Set.of("SHIPPED", "IN_TRANSIT");
    private static final Set<String> SOLD_STATUSES = Set.of("DELIVERED", "ISSUED");

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Value("${app.seller.dashboard.new-products-days:7}")
    private int newProductsDays;

    public SellerOrdersDashboardResponse getDashboard(Integer sellerId) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(newProductsDays);

        long newProducts = productRepository.countBySellerIdAndCreatedAtGreaterThanEqual(sellerId, threshold);
        long assembling = orderItemRepository.countBySellerIdAndOrderStatusNames(sellerId, ASSEMBLING_STATUSES);
        long onTheWay = orderItemRepository.countBySellerIdAndOrderStatusNames(sellerId, ON_THE_WAY_STATUSES);
        long sold = orderItemRepository.countBySellerIdAndOrderStatusNames(sellerId, SOLD_STATUSES);

        return new SellerOrdersDashboardResponse(newProducts, assembling, onTheWay, sold);
    }
}
