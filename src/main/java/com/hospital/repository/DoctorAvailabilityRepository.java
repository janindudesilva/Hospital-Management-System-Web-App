package com.hospital.repository;

import com.hospital.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT a FROM DoctorAvailability a WHERE a.doctor.id = :doctorId")
    List<DoctorAvailability> findByDoctorId(@org.springframework.data.repository.query.Param("doctorId") Long doctorId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM DoctorAvailability a WHERE a.doctor.id = :doctorId AND a.isAvailable = true")
    List<DoctorAvailability> findByDoctorIdAndIsAvailableTrue(@org.springframework.data.repository.query.Param("doctorId") Long doctorId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM DoctorAvailability a WHERE a.doctor.id = :doctorId AND a.dayOfWeek = :dayOfWeek")
    Optional<DoctorAvailability> findByDoctorIdAndDayOfWeek(@org.springframework.data.repository.query.Param("doctorId") Long doctorId, @org.springframework.data.repository.query.Param("dayOfWeek") DayOfWeek dayOfWeek);
}
