package com.hospital.repository;

import com.hospital.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false")
    List<Doctor> findActiveDoctors();
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND d.id = :id")
    Optional<Doctor> findActiveById(@Param("id") Long id);
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND d.department.id = :departmentId")
    List<Doctor> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND (LOWER(d.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Doctor> searchDoctors(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND d.user.id = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND d.phone = :phone")
    Optional<Doctor> findByPhone(@Param("phone") String phone);
    
}
