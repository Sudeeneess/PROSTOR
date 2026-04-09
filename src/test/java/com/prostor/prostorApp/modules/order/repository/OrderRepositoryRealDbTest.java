package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.model.OrdersStatus;
import com.prostor.prostorApp.modules.user.model.Customer;
import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Order Repository Tests (PostgreSQL)")
class OrderRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private Customer customer;
    private OrdersStatus statusA;
    private OrdersStatus statusB;

    @BeforeEach
    void setUp() {
        long n = System.nanoTime();

        Role role = new Role();
        role.setName("ORD_TEST_ROLE_" + n);
        entityManager.persistAndFlush(role);

        User user = new User();
        user.setUserName("ord_u_" + n);
        user.setPasswordHash("hash");
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(user);

        customer = new Customer();
        customer.setUser(user);
        entityManager.persistAndFlush(customer);

        statusA = new OrdersStatus();
        statusA.setName("ORD_ST_A_" + n);
        entityManager.persistAndFlush(statusA);

        statusB = new OrdersStatus();
        statusB.setName("ORD_ST_B_" + n);
        entityManager.persistAndFlush(statusB);
    }

    @Test
    @DisplayName("Should find orders by customer id")
    void findByCustomerId_ShouldReturnOrders() {
        Order o = newOrder(customer, statusA, 50.0, LocalDateTime.now());
        entityManager.persistAndFlush(o);

        List<Order> found = orderRepository.findByCustomerId(customer.getId());

        assertEquals(1, found.size());
        assertEquals(o.getId(), found.get(0).getId());
        assertEquals(50.0, found.get(0).getTotalAmount(), 0.001);
    }

    @Test
    @DisplayName("Should page orders by orders status id")
    void findByOrdersStatusId_ShouldReturnPage() {
        for (int i = 0; i < 3; i++) {
            entityManager.persistAndFlush(newOrder(customer, statusA, 10.0 + i, LocalDateTime.now()));
        }

        Pageable pageable = PageRequest.of(0, 2);
        Page<Order> page = orderRepository.findByOrdersStatusId(statusA.getId(), pageable);

        assertEquals(3, page.getTotalElements());
        assertEquals(2, page.getContent().size());
        assertEquals(2, page.getTotalPages());
    }

    @Test
    @DisplayName("Should sum total amount between dates")
    void sumTotalAmountBetween_ShouldAggregate() {
        LocalDateTime start = LocalDateTime.of(2025, 3, 1, 0, 0);
        LocalDateTime mid = LocalDateTime.of(2025, 3, 15, 12, 0);
        LocalDateTime end = LocalDateTime.of(2025, 3, 31, 23, 59);

        entityManager.persistAndFlush(newOrder(customer, statusA, 100.0, mid));
        entityManager.persistAndFlush(newOrder(customer, statusB, 50.0, mid));

        BigDecimal sum = orderRepository.sumTotalAmountBetween(start, end);

        assertEquals(0, sum.compareTo(new BigDecimal("150.0")));
    }

    private Order newOrder(Customer c, OrdersStatus st, double total, LocalDateTime when) {
        Order o = new Order();
        o.setCustomer(c);
        o.setOrdersStatus(st);
        o.setOrderDate(when);
        o.setTotalAmount(total);
        return o;
    }
}
