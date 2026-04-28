package com.hospital.service;

import com.hospital.model.TimeSlot;
import com.hospital.model.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TimeSlotService {

    List<TimeSlot> getAvailableSlots(Long doctorId, LocalDate date);

    List<TimeSlot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date);
    
    List<TimeSlot> getSlotsByDoctorAndDateRange(Long doctorId, LocalDate startDate, LocalDate endDate);

    // Used by DoctorAvailability updates
    void generateSlotsForNextDays(Long doctorId, int daysToGenerate);

    TimeSlot updateSlotStatus(Long slotId, SlotStatus status);

    void blockSlot(Long slotId);

    void unblockSlot(Long slotId);

    TimeSlot toggleSlot(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime, SlotStatus status);
}
