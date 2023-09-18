package com.greenhouse.repository;

import com.greenhouse.model.Product_Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<Product_Category, Integer> {
    // Các phương thức truy vấn tùy chỉnh (nếu cần) có thể được thêm vào đây.
}
