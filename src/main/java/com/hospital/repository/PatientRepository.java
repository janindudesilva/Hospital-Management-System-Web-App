package com.hospital.repository;

import com.hospital.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    @Query("SELECT p FROM Patient p WHERE p.deleted = false")
    List<Patient> findActivePatients();
    
    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND p.id = :id")
    Optional<Patient> findActiveById(@Param("id") Long id);
    
    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND (LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Patient> searchPatients(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND p.phone = :phone")
    Optional<Patient> findByPhone(@Param("phone") String phone);
    
    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND p.user.id = :userId")
    Optional<Patient> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT p FROM Patient p JOIN Appointment a ON a.patient = p " +
           "WHERE a.deleted = false AND a.doctor.id = :doctorId AND p.deleted = false")
    List<Patient> findAllByDoctorId(@Param("doctorId") Long doctorId);
    
}
