package com.hospital.repository;

import com.hospital.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    @Query("SELECT d FROM Department d WHERE d.deleted = false")
    List<Department> findActiveDepartments();
    
    @Query("SELECT d FROM Department d WHERE d.deleted = false AND d.id = :id")
    Optional<Department> findActiveById(@Param("id") Long id);
    
    @Query("SELECT d FROM Department d WHERE d.deleted = false AND d.name = :name")
    Optional<Department> findByName(@Param("name") String name);
    
    Boolean existsByName(String name);
    
}
