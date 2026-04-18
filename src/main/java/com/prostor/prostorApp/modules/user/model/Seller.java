package com.prostor.prostorApp.modules.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "seller")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id", nullable = false,unique = true)
    private User user;

    @Column(name = "inn", nullable = false,unique = true,length = 12)
    private String inn;

    @Column(name = "company_name", nullable = false,length = 50)
    private String companyName;
}
