package com.greenhouse.repository;

import com.greenhouse.model.Authorities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthoritiesRepository extends JpaRepository<Authorities, Integer> {
    // Các phương thức tùy chỉnh có thể được thêm vào đây nếu cần
}
