package com.hospital.repository;

import com.hospital.model.TimeSlot;
import com.hospital.model.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctorIdAndSlotDateOrderByStartTime(Long doctorId, LocalDate slotDate);

    List<TimeSlot> findByDoctorIdAndSlotDateAndStatusOrderByStartTime(Long doctorId, LocalDate slotDate, SlotStatus status);

    List<TimeSlot> findByDoctorIdAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(Long doctorId, LocalDate startDate, LocalDate endDate);

    void deleteByDoctorIdAndSlotDateGreaterThanEqual(Long doctorId, LocalDate date);
}
