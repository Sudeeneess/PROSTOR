package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.SellerOrdersDashboardResponse;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Seller Orders Dashboard Service Tests")
class SellerOrdersDashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private SellerOrdersDashboardService sellerOrdersDashboardService;

    @Test
    @DisplayName("Should aggregate seller dashboard counters")
    void getDashboard_ShouldReturnCounters() {
        ReflectionTestUtils.setField(sellerOrdersDashboardService, "newProductsDays", 7);

        when(productRepository.countBySellerIdAndCreatedAtGreaterThanEqual(eq(11), any(LocalDateTime.class)))
                .thenReturn(12L);
        when(orderItemRepository.countBySellerIdAndOrderStatusNames(eq(11), anyCollection()))
                .thenAnswer(invocation -> {
                    Set<String> statuses = Set.copyOf(invocation.getArgument(1));
                    if (statuses.equals(Set.of("PENDING", "CONFIRMED"))) {
                        return 5L;
                    }
                    if (statuses.equals(Set.of("SHIPPED", "IN_TRANSIT"))) {
                        return 8L;
                    }
                    if (statuses.equals(Set.of("DELIVERED", "ISSUED"))) {
                        return 41L;
                    }
                    return 0L;
                });

        SellerOrdersDashboardResponse response = sellerOrdersDashboardService.getDashboard(11);

        assertEquals(12L, response.getNewProducts());
        assertEquals(5L, response.getAssembling());
        assertEquals(8L, response.getOnTheWay());
        assertEquals(41L, response.getSold());

        verify(productRepository).countBySellerIdAndCreatedAtGreaterThanEqual(eq(11), any(LocalDateTime.class));
        verify(orderItemRepository, times(3)).countBySellerIdAndOrderStatusNames(eq(11), anyCollection());
    }
}
