package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.OrderItemRequest;
import com.prostor.prostorApp.modules.order.dto.OrderRequest;
import com.prostor.prostorApp.modules.order.dto.OrderResponse;
import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.OrdersStatus;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.OrderRepository;
import com.prostor.prostorApp.modules.order.repository.OrdersStatusRepository;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.model.Customer;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.CustomerRepository;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Order Service Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrdersStatusRepository ordersStatusRepository;
    @Mock
    private WarehouseStockService warehouseStockService;

    @InjectMocks
    private OrderService orderService;

    private Customer customer;
    private OrdersStatus pending;
    private OrdersStatus confirmed;
    private OrdersStatus cancelled;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(orderService, "commissionRate", 0.10);

        customer = new Customer();
        customer.setId(1);

        pending = status(1, "PENDING");
        confirmed = status(2, "CONFIRMED");
        cancelled = status(3, "CANCELLED");

        Category cat = new Category();
        cat.setId(1);
        Seller seller = new Seller();
        seller.setId(1);
        product = new Product();
        product.setId(10);
        product.setName("Widget");
        product.setPrice(50.0);
        product.setSeller(seller);
        product.setCategory(cat);

        order = new Order();
        order.setId(100);
        order.setCustomer(customer);
        order.setOrdersStatus(pending);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(0);
    }

    private static OrdersStatus status(int id, String name) {
        OrdersStatus s = new OrdersStatus();
        s.setId(id);
        s.setName(name);
        return s;
    }

    @Test
    @DisplayName("Should return order by id")
    void getById_WhenExists_ShouldReturnResponse() {
        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());

        OrderResponse r = orderService.getById(100);

        assertEquals(100, r.getId());
        assertEquals(1, r.getCustomerId());
        assertEquals("PENDING", r.getStatus().getName());
    }

    @Test
    @DisplayName("Should throw when order not found")
    void getById_WhenMissing_ShouldThrow() {
        when(orderRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> orderService.getById(1));
    }

    @Test
    @DisplayName("Should page all orders")
    void getAll_ShouldReturnPage() {
        Pageable p = PageRequest.of(0, 10);
        when(orderRepository.findAll(p)).thenReturn(new PageImpl<>(List.of(order), p, 1));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());

        Page<OrderResponse> page = orderService.getAll(p);

        assertEquals(1, page.getTotalElements());
    }

    @Test
    @DisplayName("Should list orders by customer")
    void getByCustomer_ShouldReturnList() {
        when(orderRepository.findByCustomerId(1)).thenReturn(List.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());

        List<OrderResponse> list = orderService.getByCustomer(1);

        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Should page orders by status")
    void getByStatus_ShouldReturnPage() {
        Pageable p = PageRequest.of(0, 10);
        when(orderRepository.findByOrdersStatusId(1, p)).thenReturn(new PageImpl<>(List.of(order), p, 1));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());

        Page<OrderResponse> page = orderService.getByStatus(1, p);

        assertEquals(1, page.getTotalElements());
    }

    @Test
    @DisplayName("Should create order with items and total")
    void createOrder_WhenValid_ShouldSave() {
        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setProductId(10);
        itemReq.setAmount(100.0);

        OrderRequest req = new OrderRequest();
        req.setCustomerId(1);
        req.setItems(List.of(itemReq));

        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(ordersStatusRepository.findByName("PENDING")).thenReturn(Optional.of(pending));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) {
                o.setId(200);
            }
            return o;
        });
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(200)).thenReturn(Collections.emptyList());

        OrderResponse r = orderService.createOrder(req);

        assertEquals(200, r.getId());
        assertEquals(100.0, r.getTotalAmount(), 0.001);
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(orderItemRepository).save(any(OrderItem.class));
    }

    @Test
    @DisplayName("Should throw when customer missing on create")
    void createOrder_WhenCustomerMissing_ShouldThrow() {
        OrderRequest req = new OrderRequest();
        req.setCustomerId(99);
        req.setItems(List.of(itemRequest(10, 1.0)));
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> orderService.createOrder(req));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw when PENDING status missing on create")
    void createOrder_WhenPendingMissing_ShouldThrow() {
        OrderRequest req = new OrderRequest();
        req.setCustomerId(1);
        req.setItems(List.of(itemRequest(10, 1.0)));
        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(ordersStatusRepository.findByName("PENDING")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> orderService.createOrder(req));
    }

    @Test
    @DisplayName("Should throw when product missing on create")
    void createOrder_WhenProductMissing_ShouldThrow() {
        OrderRequest req = new OrderRequest();
        req.setCustomerId(1);
        req.setItems(List.of(itemRequest(999, 1.0)));
        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(ordersStatusRepository.findByName("PENDING")).thenReturn(Optional.of(pending));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(200);
            return o;
        });
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> orderService.createOrder(req));
    }

    @Test
    @DisplayName("Should confirm PENDING order and reserve stock")
    void confirmOrder_WhenPending_ShouldConfirm() {
        OrderItem item = new OrderItem();
        item.setId(1);
        item.setOrder(order);
        item.setProduct(product);
        item.setAmount(10);
        item.setIsOrdered(false);
        item.setIsFinalized(false);

        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(List.of(item));
        when(warehouseStockService.getTotalAvailableQuantity(10)).thenReturn(5);
        when(warehouseStockService.reserveProduct(10, 1)).thenReturn(true);
        when(ordersStatusRepository.findByName("CONFIRMED")).thenReturn(Optional.of(confirmed));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse r = orderService.confirmOrder(100);

        assertEquals("CONFIRMED", r.getStatus().getName());
        assertTrue(item.getIsOrdered());
        verify(warehouseStockService).reserveProduct(10, 1);
    }

    @Test
    @DisplayName("Should throw when confirming non-PENDING order")
    void confirmOrder_WhenNotPending_ShouldThrow() {
        order.setOrdersStatus(confirmed);
        when(orderRepository.findById(100)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class, () -> orderService.confirmOrder(100));
    }

    @Test
    @DisplayName("Should throw when stock insufficient on confirm")
    void confirmOrder_WhenNoStock_ShouldThrow() {
        order.setOrdersStatus(pending);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setIsOrdered(false);
        item.setIsFinalized(false);

        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(List.of(item));
        when(warehouseStockService.getTotalAvailableQuantity(10)).thenReturn(0);

        assertThrows(IllegalStateException.class, () -> orderService.confirmOrder(100));
        verify(warehouseStockService, never()).reserveProduct(anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should cancel PENDING order")
    void cancelOrder_WhenPending_ShouldCancel() {
        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());
        when(ordersStatusRepository.findByName("CANCELLED")).thenReturn(Optional.of(cancelled));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse r = orderService.cancelOrder(100);

        assertEquals("CANCELLED", r.getStatus().getName());
        verify(warehouseStockService, never()).releaseProduct(anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should cancel CONFIRMED order and release stock")
    void cancelOrder_WhenConfirmed_ShouldRelease() {
        order.setOrdersStatus(confirmed);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setIsOrdered(true);
        item.setIsFinalized(false);

        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(100)).thenReturn(List.of(item));
        when(warehouseStockService.releaseProduct(10, 1)).thenReturn(true);
        when(ordersStatusRepository.findByName("CANCELLED")).thenReturn(Optional.of(cancelled));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.cancelOrder(100);

        verify(warehouseStockService).releaseProduct(10, 1);
        assertFalse(item.getIsOrdered());
    }

    @Test
    @DisplayName("Should throw when cancel invalid status")
    void cancelOrder_WhenDelivered_ShouldThrow() {
        OrdersStatus delivered = status(4, "DELIVERED");
        order.setOrdersStatus(delivered);
        when(orderRepository.findById(100)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class, () -> orderService.cancelOrder(100));
    }

    @Test
    @DisplayName("Should update order status by id")
    void updateStatus_ShouldSave() {
        OrdersStatus newSt = status(5, "DELIVERED");
        when(orderRepository.findById(100)).thenReturn(Optional.of(order));
        when(ordersStatusRepository.findById(5)).thenReturn(Optional.of(newSt));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(100)).thenReturn(Collections.emptyList());

        OrderResponse r = orderService.updateStatus(100, 5);

        assertEquals("DELIVERED", r.getStatus().getName());
    }

    @Test
    @DisplayName("Should delete existing order")
    void deleteOrder_WhenExists_ShouldDelete() {
        when(orderRepository.existsById(100)).thenReturn(true);

        orderService.deleteOrder(100);

        verify(orderRepository).deleteById(100);
    }

    @Test
    @DisplayName("Should throw when deleting missing order")
    void deleteOrder_WhenMissing_ShouldThrow() {
        when(orderRepository.existsById(100)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> orderService.deleteOrder(100));
        verify(orderRepository, never()).deleteById(anyInt());
    }

    private static OrderItemRequest itemRequest(int productId, double amount) {
        OrderItemRequest r = new OrderItemRequest();
        r.setProductId(productId);
        r.setAmount(amount);
        return r;
    }
}
