package com.greenhouse.repository;

import com.greenhouse.model.Product_Reviews;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Product_ReviewsRepository extends JpaRepository<Product_Reviews, Integer> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh ở đây nếu cần.
}
