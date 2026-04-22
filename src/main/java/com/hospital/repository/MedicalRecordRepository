package com.hospital.repository;

import com.hospital.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false")
    List<MedicalRecord> findActiveMedicalRecords();
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.id = :id")
    Optional<MedicalRecord> findActiveById(@Param("id") Long id);
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.patient.id = :patientId ORDER BY mr.recordDate DESC")
    List<MedicalRecord> findByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.doctor.id = :doctorId ORDER BY mr.recordDate DESC")
    List<MedicalRecord> findByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.patient.id = :patientId AND mr.doctor.id = :doctorId ORDER BY mr.recordDate DESC")
    List<MedicalRecord> findByPatientIdAndDoctorId(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.patient.id = :patientId AND mr.recordDate BETWEEN :startDate AND :endDate")
    List<MedicalRecord> findByPatientIdAndDateRange(@Param("patientId") Long patientId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT mr FROM MedicalRecord mr WHERE mr.deleted = false AND mr.isChronic = true")
    List<MedicalRecord> findChronicRecords();
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM medical_records WHERE id = :id", nativeQuery = true)
    void forceHardDelete(@Param("id") Long id);
    
}
