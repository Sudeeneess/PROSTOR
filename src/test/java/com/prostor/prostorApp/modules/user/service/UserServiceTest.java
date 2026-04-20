package com.prostor.prostorApp.modules.user.service;

import com.prostor.prostorApp.common.exception.BusinessException;
import com.prostor.prostorApp.modules.admin.model.Administrator;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.order.model.Order;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.OrderReturn;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.OrderMovementRepository;
import com.prostor.prostorApp.modules.order.repository.OrderRepository;
import com.prostor.prostorApp.modules.order.repository.OrderReturnRepository;
import com.prostor.prostorApp.modules.order.repository.PaymentRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.dto.UserCreateRequest;
import com.prostor.prostorApp.modules.user.dto.UserResponse;
import com.prostor.prostorApp.modules.user.model.*;
import com.prostor.prostorApp.modules.user.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private AdministratorRepository administratorRepository;
    @Mock
    private WarehouseManagerRepository warehouseManagerRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderMovementRepository orderMovementRepository;
    @Mock
    private OrderReturnRepository orderReturnRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private UserService userService;

    private Role roleCustomer;
    private Role roleSeller;
    private User user;

    @BeforeEach
    void setUp() {
        roleCustomer = new Role(1, "CUSTOMER");
        roleSeller = new Role(2, "SELLER");

        user = new User();
        user.setId(10);
        user.setUserName("john");
        user.setPasswordHash("oldHash");
        user.setContactPhone("79001234567");
        user.setRole(roleCustomer);
        user.setCreatedAt(LocalDateTime.parse("2024-01-01T10:00:00"));

        lenient().when(passwordEncoder.encode(anyString())).thenReturn("encoded");
    }

    @Test
    @DisplayName("getAllUsers maps all entities")
    void getAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserResponse> list = userService.getAllUsers();

        assertEquals(1, list.size());
        assertEquals("john", list.get(0).getUserName());
        assertEquals(1, list.get(0).getRole().getId());
    }

    @Test
    @DisplayName("getUserById returns response when found")
    void getUserById_found() {
        when(userRepository.findById(10)).thenReturn(Optional.of(user));

        UserResponse r = userService.getUserById(10);

        assertEquals(10, r.getId());
        assertEquals("john", r.getUserName());
    }

    @Test
    @DisplayName("getUserById throws when missing")
    void getUserById_missing() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.getUserById(1));
        assertTrue(ex.getMessage().contains("User not found"));
    }

    @Test
    @DisplayName("getUserByUsername returns response when found")
    void getUserByUsername_found() {
        when(userRepository.findByUserName("john")).thenReturn(Optional.of(user));

        UserResponse r = userService.getUserByUsername("john");

        assertEquals(10, r.getId());
    }

    @Test
    @DisplayName("getUserByUsername throws when missing")
    void getUserByUsername_missing() {
        when(userRepository.findByUserName("x")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserByUsername("x"));
    }

    @Test
    @DisplayName("createUser throws when username taken")
    void createUser_duplicateUsername() {
        UserCreateRequest req = validRequest();
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> userService.createUser(req));
        verify(roleRepository, never()).findById(anyInt());
    }

    @Test
    @DisplayName("createUser throws when phone taken")
    void createUser_duplicatePhone() {
        UserCreateRequest req = validRequest();
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.createUser(req));
    }

    @Test
    @DisplayName("createUser throws when role missing")
    void createUser_roleMissing() {
        UserCreateRequest req = validRequest();
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.createUser(req));
    }

    @Test
    @DisplayName("createUser creates Customer row for CUSTOMER role")
    void createUser_customerRole() {
        UserCreateRequest req = validRequest();
        req.setRoleId(1);
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(1)).thenReturn(Optional.of(roleCustomer));
        when(customerRepository.existsByUserId(anyInt())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(20);
            return u;
        });

        UserResponse r = userService.createUser(req);

        assertEquals(20, r.getId());
        verify(customerRepository).save(any(Customer.class));
        verify(sellerRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUser creates Seller row for SELLER role")
    void createUser_sellerRole() {
        UserCreateRequest req = validRequest();
        req.setRoleId(2);
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(2)).thenReturn(Optional.of(roleSeller));
        when(sellerRepository.findByUserId(anyInt())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(21);
            u.setRole(roleSeller);
            return u;
        });

        userService.createUser(req);

        verify(sellerRepository).save(any(Seller.class));
    }

    @Test
    @DisplayName("createUser creates Administrator for ADMIN role")
    void createUser_adminRole() {
        Role adminRole = new Role(3, "ADMIN");
        UserCreateRequest req = validRequest();
        req.setRoleId(3);
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(3)).thenReturn(Optional.of(adminRole));
        when(administratorRepository.existsByUserId(anyInt())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(22);
            u.setRole(adminRole);
            return u;
        });

        userService.createUser(req);

        verify(administratorRepository).save(any(Administrator.class));
    }

    @Test
    @DisplayName("createUser creates WarehouseManager for WAREHOUSE_MANAGER role")
    void createUser_warehouseManagerRole() {
        Role wmRole = new Role(4, "WAREHOUSE_MANAGER");
        UserCreateRequest req = validRequest();
        req.setRoleId(4);
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(4)).thenReturn(Optional.of(wmRole));
        when(warehouseManagerRepository.existsByUserId(anyInt())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(23);
            u.setRole(wmRole);
            return u;
        });

        userService.createUser(req);

        verify(warehouseManagerRepository).save(any(WarehouseManager.class));
    }

    @Test
    @DisplayName("createUser skips Customer save when profile already exists")
    void createUser_customerAlreadyExists() {
        UserCreateRequest req = validRequest();
        when(userRepository.findByUserName(req.getUserName())).thenReturn(Optional.empty());
        when(userRepository.existsByContactPhone(req.getContactPhone())).thenReturn(false);
        when(roleRepository.findById(1)).thenReturn(Optional.of(roleCustomer));
        when(customerRepository.existsByUserId(anyInt())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(30);
            u.setRole(roleCustomer);
            return u;
        });

        userService.createUser(req);

        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUser throws when user missing")
    void updateUser_missingUser() {
        when(userRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.updateUser(10, validRequest()));
    }

    @Test
    @DisplayName("updateUser throws when new username belongs to another user")
    void updateUser_usernameConflict() {
        UserCreateRequest req = validRequest();
        req.setUserName("taken");
        User other = new User();
        other.setId(99);
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(userRepository.findByUserName("taken")).thenReturn(Optional.of(other));

        assertThrows(RuntimeException.class, () -> userService.updateUser(10, req));
    }

    @Test
    @DisplayName("updateUser allows keeping same username")
    void updateUser_sameUsername() {
        UserCreateRequest req = validRequest();
        req.setUserName("john");
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(userRepository.findByUserName("john")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse r = userService.updateUser(10, req);

        assertEquals("john", r.getUserName());
    }

    @Test
    @DisplayName("updateUser encodes new password when provided")
    void updateUser_newPassword() {
        UserCreateRequest req = validRequest();
        req.setPassword("newSecret");
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.updateUser(10, req);

        verify(passwordEncoder).encode("newSecret");
    }

    @Test
    @DisplayName("updateUser skips password when empty string")
    void updateUser_emptyPasswordNoReencode() {
        UserCreateRequest req = validRequest();
        req.setPassword("");
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.updateUser(10, req);

        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("updateUser changes role and swaps role-specific records")
    void updateUser_roleChange() {
        UserCreateRequest req = validRequest();
        req.setRoleId(2);
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(roleRepository.findById(2)).thenReturn(Optional.of(roleSeller));
        Customer cust = new Customer();
        when(customerRepository.findByUserId(10)).thenReturn(Optional.of(cust));
        when(sellerRepository.findByUserId(10)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setRole(roleSeller);
            return u;
        });

        userService.updateUser(10, req);

        verify(customerRepository).delete(cust);
        verify(sellerRepository).save(any(Seller.class));
    }

    @Test
    @DisplayName("updateUser throws when new role id not found")
    void updateUser_newRoleMissing() {
        UserCreateRequest req = validRequest();
        req.setRoleId(99);
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(roleRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.updateUser(10, req));
    }

    @Test
    @DisplayName("deleteUser throws when missing")
    void deleteUser_missing() {
        when(userRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.deleteUser(10));
    }

    @Test
    @DisplayName("deleteUser removes customer profile then user")
    void deleteUser_customer() {
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        Customer customer = new Customer();
        customer.setId(55);
        when(customerRepository.findByUserId(10)).thenReturn(Optional.of(customer));
        when(orderRepository.findByCustomerId(55)).thenReturn(List.of());

        userService.deleteUser(10);

        verify(customerRepository).delete(customer);
        verify(userRepository).deleteById(10);
    }

    @Test
    @DisplayName("deleteUser releases active reservations and deletes customer orders cascade")
    void deleteUser_customerWithOrdersCascade() {
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        Customer customer = new Customer();
        customer.setId(77);
        when(customerRepository.findByUserId(10)).thenReturn(Optional.of(customer));

        Order order = new Order();
        order.setId(500);
        when(orderRepository.findByCustomerId(77)).thenReturn(List.of(order));

        OrderReturn orderReturn = new OrderReturn();
        orderReturn.setId(900);
        OrderItem item = new OrderItem();
        item.setId(700);
        item.setIsOrdered(true);
        item.setIsFinalized(false);
        item.setOrderReturn(orderReturn);
        when(orderItemRepository.findByOrderId(500)).thenReturn(List.of(item));
        when(orderItemRepository.countByOrderReturnId(900)).thenReturn(0L);

        userService.deleteUser(10);

        verify(orderItemRepository).save(any(OrderItem.class));
        verify(paymentRepository).deleteByOrderItemId(700);
        verify(orderMovementRepository).deleteByOrderItemId(700);
        verify(orderItemRepository).deleteByOrderId(500);
        verify(orderReturnRepository).deleteById(900);
        verify(orderRepository).deleteById(500);
        verify(customerRepository).delete(customer);
        verify(userRepository).deleteById(10);
    }

    @Test
    @DisplayName("deleteUser throws business conflict when seller has products")
    void deleteUser_sellerWithProductsConflict() {
        user.setRole(roleSeller);
        when(userRepository.findById(10)).thenReturn(Optional.of(user));

        Seller seller = new Seller();
        seller.setId(88);
        when(sellerRepository.findByUserId(10)).thenReturn(Optional.of(seller));
        when(productRepository.findBySellerId(88)).thenReturn(List.of(new com.prostor.prostorApp.modules.product.model.Product()));

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.deleteUser(10));
        assertEquals("SELLER_HAS_PRODUCTS", ex.getCode());
        verify(userRepository, never()).deleteById(10);
    }

    @Test
    @DisplayName("getUsersByRole filters by role id")
    void getUsersByRole() {
        when(userRepository.findByRoleId(1)).thenReturn(List.of(user));

        List<UserResponse> list = userService.getUsersByRole(1);

        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("getRolesWithUserCount aggregates counts")
    void getRolesWithUserCount() {
        Role r1 = new Role(1, "CUSTOMER");
        Role r2 = new Role(2, "SELLER");
        when(roleRepository.findAll()).thenReturn(List.of(r1, r2));
        when(userRepository.findByRoleId(1)).thenReturn(List.of(user));
        when(userRepository.findByRoleId(2)).thenReturn(List.of());

        List<Map<String, Object>> rows = userService.getRolesWithUserCount();

        assertEquals(2, rows.size());
        Map<String, Object> customerRow = rows.stream()
                .filter(m -> Integer.valueOf(1).equals(m.get("role_id")))
                .findFirst()
                .orElseThrow();
        Map<String, Object> sellerRow = rows.stream()
                .filter(m -> Integer.valueOf(2).equals(m.get("role_id")))
                .findFirst()
                .orElseThrow();
        assertEquals(1, customerRow.get("users_count"));
        assertEquals(0, sellerRow.get("users_count"));
    }

    private static UserCreateRequest validRequest() {
        UserCreateRequest r = new UserCreateRequest();
        r.setUserName("newuser");
        r.setPassword("pass");
        r.setContactPhone("79001112233");
        r.setRoleId(1);
        return r;
    }
}
