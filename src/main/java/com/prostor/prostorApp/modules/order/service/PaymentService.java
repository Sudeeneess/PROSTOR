package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.PaymentDto;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.Payment;
import com.prostor.prostorApp.modules.order.model.PaymentsStatus;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.PaymentRepository;
import com.prostor.prostorApp.modules.order.repository.PaymentsStatusRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentsStatusRepository paymentsStatusRepository;

    private PaymentDto toDto(Payment payment) {
        if (payment == null) return null;
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setOrderItemId(payment.getOrderItem().getId());
        dto.setStatus(payment.getPaymentsStatus().getName());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }

    public List<PaymentDto> getByOrderItem(Integer orderItemId) {
        return paymentRepository.findByOrderItemId(orderItemId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PaymentDto getById(Integer id) {
        return paymentRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Платеж с идентификатором не найден: " + id));
    }

    @Transactional
    public PaymentDto createPayment(Integer orderItemId) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new EntityNotFoundException("Товар заказа не найден с идентификатором: " + orderItemId));

        if (!paymentRepository.findByOrderItemId(orderItemId).isEmpty()) {
            throw new IllegalStateException("Оплата за этот элемент заказа уже произведена");
        }

        PaymentsStatus status = paymentsStatusRepository.findByName("PENDING")
                .orElseThrow(() -> new EntityNotFoundException("Статус ожидающего платежа не найден"));

        Payment payment = new Payment();
        payment.setOrderItem(item);
        payment.setPaymentsStatus(status);
        payment.setCreatedAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        return toDto(saved);
    }

    @Transactional
    public PaymentDto confirmPayment(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Платеж с идентификатором не найден: " + paymentId));

        PaymentsStatus paidStatus = paymentsStatusRepository.findByName("SUCCESS")
                .orElseThrow(() -> new EntityNotFoundException("Статус платежа ОПЛАЧЕН, не найден"));
        payment.setPaymentsStatus(paidStatus);


        OrderItem item = payment.getOrderItem();
        item.setIsFinalized(true);
        item.setSoldAt(LocalDateTime.now());
        orderItemRepository.save(item);

        Payment updated = paymentRepository.save(payment);
        return toDto(updated);
    }
}