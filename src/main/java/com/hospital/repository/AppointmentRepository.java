package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false")
    List<Appointment> findActiveAppointments();
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.id = :id")
    Optional<Appointment> findActiveById(@Param("id") Long id);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.patient.id = :patientId")
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.doctor.id = :doctorId")
    List<Appointment> findByDoctorId(@Param("doctorId") Long doctorId);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.doctor.id = :doctorId " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((a.startTime <= :endTime AND a.endTime >= :startTime))")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId, 
                                                  @Param("startTime") LocalDateTime startTime, 
                                                  @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.status = :status")
    List<Appointment> findByStatus(@Param("status") AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.deleted = false AND a.appointmentDate >= :currentDate ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.deleted = false AND a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    Long countAppointmentsForDoctorOnDate(@Param("doctorId") Long doctorId, 
                                         @Param("appointmentDate") LocalDateTime appointmentDate);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM appointments WHERE id = :id", nativeQuery = true)
    void forceHardDelete(@Param("id") Long id);
    
}
