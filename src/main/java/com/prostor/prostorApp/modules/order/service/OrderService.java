package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.OrderItemRequest;
import com.prostor.prostorApp.modules.order.dto.OrderItemResponse;
import com.prostor.prostorApp.modules.order.dto.OrderRequest;
import com.prostor.prostorApp.modules.order.dto.OrderResponse;
import com.prostor.prostorApp.modules.order.dto.OrderStatusDto;
import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.OrdersStatus;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.OrderRepository;
import com.prostor.prostorApp.modules.order.repository.OrdersStatusRepository;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.model.Customer;
import com.prostor.prostorApp.modules.user.repository.CustomerRepository;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrdersStatusRepository ordersStatusRepository;
    private final WarehouseStockService warehouseStockService;

    @Value("${app.commission.rate:0.10}")
    private double commissionRate;

    private OrderItemResponse toItemResponse(OrderItem item) {
        if (item == null) return null;
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setAmount(item.getAmount());
        response.setSellerCommission(item.getSellerCommission());
        response.setNetPayout(item.getNetPayout());
        response.setIsOrdered(item.getIsOrdered());
        response.setIsFinalized(item.getIsFinalized());
        response.setSoldAt(item.getSoldAt());
        return response;
    }

    private OrderResponse toResponse(Order order) {
        if (order == null) return null;
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerId(order.getCustomer().getId());

        OrderStatusDto statusDto = new OrderStatusDto();
        statusDto.setId(order.getOrdersStatus().getId());
        statusDto.setName(order.getOrdersStatus().getName());
        response.setStatus(statusDto);

        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        response.setItems(items.stream().map(this::toItemResponse).collect(Collectors.toList()));
        return response;
    }

    private OrderItem toItemEntity(OrderItemRequest request, Order order, Product product) {
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setAmount(request.getAmount());

        double commission = request.getAmount() * commissionRate;
        item.setSellerCommission(commission);
        item.setNetPayout(request.getAmount() - commission);
        item.setIsOrdered(false);
        item.setIsFinalized(false);
        return item;
    }

    public Page<OrderResponse> getAll(Pageable pageable) {
        log.debug("Getting all orders with pagination");
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    public OrderResponse getById(Integer id) {
        log.debug("Getting order by id: {}", id);
        return orderRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Заказ с идентификатором не найден: " + id));
    }

    public List<OrderResponse> getByCustomer(Integer customerId) {
        log.debug("Getting orders by customer id: {}", customerId);
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getByStatus(Integer statusId, Pageable pageable) {
        log.debug("Getting orders by status id: {}", statusId);
        return orderRepository.findByOrdersStatusId(statusId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating new order for customer id: {}", request.getCustomerId());

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Клиент с идентификатором не найден: " + request.getCustomerId()));

        OrdersStatus status = ordersStatusRepository.findByName("PENDING")
                .orElseThrow(() -> new EntityNotFoundException("Статус по умолчанию \"PENDING\" не найден"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrdersStatus(status);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(0);

        Order savedOrder = orderRepository.save(order);

        double total = 0;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Продукт не найден с идентификатором: " + itemReq.getProductId()));

            OrderItem item = toItemEntity(itemReq, savedOrder, product);
            orderItemRepository.save(item);
            total += item.getAmount();
        }

        savedOrder.setTotalAmount(total);
        Order updatedOrder = orderRepository.save(savedOrder);

        log.info("Order created successfully with id: {}", updatedOrder.getId());
        return toResponse(updatedOrder);
    }

    /**
     * Подтверждение заказа с атомарным резервированием товаров
     * Исправлена проблема race condition при параллельных подтверждениях
     */
    @Transactional
    public OrderResponse confirmOrder(Integer orderId) {
        log.info("Confirming order with id: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Заказ с идентификатором не найден: " + orderId));

        if (!"PENDING".equalsIgnoreCase(order.getOrdersStatus().getName())) {
            throw new IllegalStateException("Заказ не может быть подтвержден в текущем статусе: " + order.getOrdersStatus().getName());
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        // ========== КРИТИЧЕСКАЯ ЧАСТЬ: АТОМАРНОЕ РЕЗЕРВИРОВАНИЕ ТОВАРОВ ==========
        // Проходим по всем товарам в заказе
        for (OrderItem item : items) {
            // 1. Проверяем общее наличие товара на всех складах
            int totalAvailable = warehouseStockService.getTotalAvailableQuantity(item.getProduct().getId());

            log.debug("Product: {}, available: {}, requested: 1",
                    item.getProduct().getName(), totalAvailable);

            if (totalAvailable <= 0) {
                throw new IllegalStateException("Товар '" + item.getProduct().getName() +
                        "' отсутствует на складе. Доступно: " + totalAvailable);
            }

            // 2. Атомарное резервирование товара (одним SQL-запросом)
            boolean reserved = warehouseStockService.reserveProduct(item.getProduct().getId(), 1);

            if (!reserved) {
                // Если не удалось зарезервировать — откатываем всю транзакцию
                throw new IllegalStateException("Не удалось зарезервировать товар '" +
                        item.getProduct().getName() + "'. Возможно, он уже был зарезервирован другим заказом.");
            }

            log.debug("Successfully reserved product: {}", item.getProduct().getName());
        }
        // ========== КОНЕЦ КРИТИЧЕСКОЙ ЧАСТИ ==========

        // Если все товары успешно зарезервированы — обновляем статусы позиций
        for (OrderItem item : items) {
            item.setIsOrdered(true);
            orderItemRepository.save(item);
        }

        // Обновляем статус всего заказа
        OrdersStatus confirmed = ordersStatusRepository.findByName("CONFIRMED")
                .orElseThrow(() -> new EntityNotFoundException("Статус CONFIRMED не найден"));
        order.setOrdersStatus(confirmed);

        Order updated = orderRepository.save(order);

        log.info("Order confirmed successfully with id: {}", orderId);
        return toResponse(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        log.info("Cancelling order with id: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Заказ с идентификатором не найден: " + orderId));

        String currentStatus = order.getOrdersStatus().getName();
        if (!"PENDING".equalsIgnoreCase(currentStatus) && !"CONFIRMED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Заказ не может быть отменен в текущем статусе: " + currentStatus);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        // Если заказ был подтвержден, нужно вернуть резервирование товаров
        if ("CONFIRMED".equalsIgnoreCase(currentStatus)) {
            for (OrderItem item : items) {
                if (item.getIsOrdered() && !item.getIsFinalized()) {
                    // Возвращаем товар на склад (отменяем резервирование)
                    boolean released = warehouseStockService.releaseProduct(item.getProduct().getId(), 1);
                    if (released) {
                        log.debug("Released product: {}", item.getProduct().getName());
                    }
                    item.setIsOrdered(false);
                    orderItemRepository.save(item);
                }
            }
        } else {
            // Если заказ был в статусе PENDING, просто снимаем флаг isOrdered
            for (OrderItem item : items) {
                if (item.getIsOrdered() && !item.getIsFinalized()) {
                    item.setIsOrdered(false);
                    orderItemRepository.save(item);
                }
            }
        }

        OrdersStatus cancelled = ordersStatusRepository.findByName("CANCELLED")
                .orElseThrow(() -> new EntityNotFoundException("Статус CANCELLED не найден"));
        order.setOrdersStatus(cancelled);

        Order updated = orderRepository.save(order);

        log.info("Order cancelled successfully with id: {}", orderId);
        return toResponse(updated);
    }

    @Transactional
    public OrderResponse updateStatus(Integer orderId, Integer statusId) {
        log.info("Updating order status: orderId={}, statusId={}", orderId, statusId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Заказ с идентификатором не найден: " + orderId));
        OrdersStatus newStatus = ordersStatusRepository.findById(statusId)
                .orElseThrow(() -> new EntityNotFoundException("Статус не найден с идентификатором: " + statusId));
        order.setOrdersStatus(newStatus);
        Order updated = orderRepository.save(order);

        log.info("Order status updated successfully: orderId={}, newStatus={}", orderId, newStatus.getName());
        return toResponse(updated);
    }

    @Transactional
    public void deleteOrder(Integer orderId) {
        log.info("Deleting order with id: {}", orderId);

        if (!orderRepository.existsById(orderId)) {
            throw new EntityNotFoundException("Заказ с идентификатором не найден: " + orderId);
        }
        orderRepository.deleteById(orderId);

        log.info("Order deleted successfully with id: {}", orderId);
    }
}