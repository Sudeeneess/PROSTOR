package com.prostor.prostorApp.modules.warehouse.repository;

import com.prostor.prostorApp.modules.warehouse.model.GoodsReception;
import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionListRow;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionListRowDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class GoodsReceptionRepositoryImpl implements GoodsReceptionRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<GoodsReceptionListRow> findForWarehouseList(
            ReceptionStatus status,
            Integer sellerId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<GoodsReceptionListRowDto> cq = cb.createQuery(GoodsReceptionListRowDto.class);
        Root<GoodsReception> reception = cq.from(GoodsReception.class);

        Join<Object, Object> seller = reception.join("seller");
        Join<Object, Object> manager = reception.join("acceptedByWarehouseManager", JoinType.LEFT);
        Join<Object, Object> products = reception.join("products", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        if (status != null) {
            predicates.add(cb.equal(reception.get("status"), status));
        }
        if (sellerId != null) {
            predicates.add(cb.equal(seller.get("id"), sellerId));
        }
        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(reception.get("createdAt"), fromDate));
        }
        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(reception.get("createdAt"), toDate));
        }

        cq.select(cb.construct(
                GoodsReceptionListRowDto.class,
                reception.get("id"),
                seller.get("id"),
                seller.get("companyName"),
                reception.get("status"),
                reception.get("createdAt"),
                reception.get("acceptedAt"),
                manager.get("id"),
                cb.count(products.get("id"))
        ));

        cq.where(predicates.toArray(new Predicate[0]));
        cq.groupBy(
                reception.get("id"),
                seller.get("id"),
                seller.get("companyName"),
                reception.get("status"),
                reception.get("createdAt"),
                reception.get("acceptedAt"),
                manager.get("id")
        );
        cq.orderBy(cb.desc(reception.get("createdAt")));

        TypedQuery<GoodsReceptionListRowDto> query = entityManager.createQuery(cq);
        List<GoodsReceptionListRowDto> rows = query.getResultList();
        return new ArrayList<>(rows);
    }
}
