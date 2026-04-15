package com.prostor.prostorApp.modules.order.security;

import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.repository.OrderRepository;
import com.prostor.prostorApp.modules.user.model.Customer;
import com.prostor.prostorApp.modules.user.repository.CustomerRepository;
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
    private final CustomerRepository customerRepository;

    public boolean isCustomerOwner(Integer orderId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = extractUsername(authentication);

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

    public boolean isCustomerOwnerByCustomerId(Integer customerId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = extractUsername(authentication);
        if (username == null) {
            return false;
        }

        try {
            Customer customer = customerRepository.findById(customerId).orElse(null);

            if (customer == null || customer.getUser() == null) {
                return false;
            }

            boolean isOwner = username.equals(customer.getUser().getUserName());

            if (isOwner) {
                log.debug("User {} is owner of customer {}", username, customerId);
            } else {
                log.debug("User {} is NOT owner of customer {}", username, customerId);
            }

            return isOwner;
        } catch (Exception e) {
            log.error("Error checking customer ownership: {}", e.getMessage());
            return false;
        }
    }

    private String extractUsername(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        if (authentication.getPrincipal() instanceof String) {
            return (String) authentication.getPrincipal();
        }
        return null;
    }
}