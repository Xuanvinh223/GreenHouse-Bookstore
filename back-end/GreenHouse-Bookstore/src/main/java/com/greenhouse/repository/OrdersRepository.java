package com.greenhouse.repository;

import com.greenhouse.model.Order_Detail;
import com.greenhouse.model.Orders;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdersRepository extends JpaRepository<Orders, String> {
    List<Orders> findByUsername(String username);
}
