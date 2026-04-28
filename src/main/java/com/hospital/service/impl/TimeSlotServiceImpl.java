package com.hospital.service.impl;

import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.model.TimeSlot;
import com.hospital.model.enums.SlotStatus;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.TimeSlotRepository;
import com.hospital.service.TimeSlotService;
import com.hospital.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TimeSlotServiceImpl implements TimeSlotService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public List<TimeSlot> getAvailableSlots(Long doctorId, LocalDate date) {
        return timeSlotRepository.findByDoctorIdAndSlotDateAndStatusOrderByStartTime(doctorId, date, SlotStatus.AVAILABLE);
    }

    @Override
    public List<TimeSlot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        return timeSlotRepository.findByDoctorIdAndSlotDateOrderByStartTime(doctorId, date);
    }

    @Override
    public List<TimeSlot> getSlotsByDoctorAndDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        return timeSlotRepository.findByDoctorIdAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(doctorId, startDate, endDate);
    }

    @Override
    @Transactional
    public void generateSlotsForNextDays(Long doctorId, int daysToGenerate) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
                
        // Fetch the doctor's weekly rules
        List<DoctorAvailability> weeklyRules = availabilityRepository.findByDoctorId(doctorId);
        if (weeklyRules.isEmpty()) {
            return;
        }

        // Map DayOfWeek to Availability Rule for O(1) lookups
        Map<DayOfWeek, DoctorAvailability> rulesMap = weeklyRules.stream()
                .filter(DoctorAvailability::isAvailable)
                .collect(Collectors.toMap(DoctorAvailability::getDayOfWeek, rule -> rule));

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysToGenerate);

        // Delete purely AVAILABLE slots in the future to regenerate them cleanly
        // We don't delete BOOKED or BLOCKED slots
        List<TimeSlot> existingFutureSlots = timeSlotRepository
                .findByDoctorIdAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(doctorId, today, endDate);

        // Remove available unbooked slots so we don't duplicate
        List<TimeSlot> slotsToDelete = existingFutureSlots.stream()
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .collect(Collectors.toList());
        
        timeSlotRepository.deleteAll(slotsToDelete);
        
        // Find existing booked/blocked slots to prevent overlaps when regenerating
        List<TimeSlot> retainedSlots = existingFutureSlots.stream()
                .filter(slot -> slot.getStatus() != SlotStatus.AVAILABLE)
                .collect(Collectors.toList());

        for (int i = 0; i <= daysToGenerate; i++) {
            LocalDate currentDate = today.plusDays(i);
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();

            DoctorAvailability rule = rulesMap.get(dayOfWeek);
            if (rule != null) {
                LocalTime currentStartTime = rule.getStartTime();
                LocalTime endTime = rule.getEndTime();
                int duration = rule.getSlotDurationMinutes();
                
                if (duration <= 0) {
                    throw new IllegalArgumentException("Slot duration must be greater than zero.");
                }

                // Generate slots
                while (true) {
                    LocalTime slotStart = currentStartTime;
                    LocalTime slotEnd = currentStartTime.plusMinutes(duration);
                    
                    // If slotEnd "wrapped around" or is 00:00, and it's not the very start, 
                    // it means we reached midnight. 
                    // But our validation prevents duration > 24h.
                    
                    // Logic: stop if slotEnd is AFTER endTime AND endTime is not midnight
                    if (endTime.isAfter(LocalTime.MIDNIGHT)) {
                        if (slotEnd.isAfter(endTime)) break;
                    } else {
                        // If endTime is 00:00, we can continue as long as slotEnd hasn't wrapped significantly
                        // However, a simpler check: if slotEnd is 00:00, that's our last slot.
                        if (slotEnd.equals(LocalTime.MIDNIGHT) && !slotStart.equals(LocalTime.MIDNIGHT)) {
                            // This is the last slot ending at midnight
                        } else if (slotEnd.isBefore(slotStart)) {
                             // Wrapped around midnight
                             break;
                        }
                    }

                    // Check if this slot conflicts with a retained (booked/blocked) slot
                    boolean conflict = retainedSlots.stream().anyMatch(slot -> 
                            slot.getSlotDate().equals(currentDate) && 
                            slot.getStartTime().equals(slotStart));

                    if (!conflict) {
                        TimeSlot slot = new TimeSlot();
                        slot.setDoctor(doctor);
                        slot.setSlotDate(currentDate);
                        slot.setStartTime(slotStart);
                        slot.setEndTime(slotEnd);
                        slot.setStatus(SlotStatus.AVAILABLE);
                        timeSlotRepository.save(slot);
                    }

                    currentStartTime = slotEnd;
                    if (currentStartTime.equals(endTime) || currentStartTime.equals(LocalTime.MIDNIGHT)) break;
                }
            }
        }
    }

    @Override
    @Transactional
    public TimeSlot updateSlotStatus(Long slotId, SlotStatus status) {
        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot", "id", slotId));
        slot.setStatus(status);
        return timeSlotRepository.save(slot);
    }

    @Override
    @Transactional
    public void blockSlot(Long slotId) {
        updateSlotStatus(slotId, SlotStatus.BLOCKED);
    }

    @Override
    @Transactional
    public void unblockSlot(Long slotId) {
        updateSlotStatus(slotId, SlotStatus.AVAILABLE);
    }

    @Override
    @Transactional
    public TimeSlot toggleSlot(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime, SlotStatus status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        // Try to find existing slot
        List<TimeSlot> existing = timeSlotRepository.findByDoctorIdAndSlotDateOrderByStartTime(doctorId, date);
        TimeSlot slot = existing.stream()
                .filter(s -> s.getStartTime().equals(startTime))
                .findFirst()
                .orElse(null);

        if (slot != null) {
            slot.setStatus(status);
            return timeSlotRepository.save(slot);
        } else {
            TimeSlot newSlot = new TimeSlot();
            newSlot.setDoctor(doctor);
            newSlot.setSlotDate(date);
            newSlot.setStartTime(startTime);
            newSlot.setEndTime(endTime);
            newSlot.setStatus(status);
            return timeSlotRepository.save(newSlot);
        }
    }
}
