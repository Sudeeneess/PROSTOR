package com.prostor.prostorApp.modules.order.security;

import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Slf4j
@Component("orderSecurity")
@RequiredArgsConstructor
public class OrderSecurity {

    private final OrderRepository orderRepository;

    public boolean isCustomerOwner(Integer orderId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = null;
        if (authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication.getPrincipal() instanceof String) {
            username = (String) authentication.getPrincipal();
        }

        if (username == null) {
            return false;
        }

        try {
            Order order = orderRepository.findById(orderId)
                    .orElse(null);

            if (order == null || order.getCustomer() == null || order.getCustomer().getUser() == null) {
                return false;
            }

            boolean isOwner = username.equals(order.getCustomer().getUser().getUserName());

            if (isOwner) {
                log.debug("User {} is owner of order {}", username, orderId);
            } else {
                log.debug("User {} is NOT owner of order {}", username, orderId);
            }

            return isOwner;

        } catch (Exception e) {
            log.error("Error checking order ownership: {}", e.getMessage());
            return false;
        }
    }
}