package com.hospital.controller;

import com.hospital.model.DoctorAvailability;
import com.hospital.model.Doctor;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.service.TimeSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/availability")
@Tag(name = "Doctor Availability", description = "APIs for managing doctor weekly schedules")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorAvailabilityController {

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private TimeSlotService timeSlotService;

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get doctor availability", description = "Get weekly schedule for a specific doctor")
    public ResponseEntity<List<DoctorAvailability>> getAvailabilityByDoctor(@PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(availabilityRepository.findByDoctorId(doctorId));
    }

    @PostMapping("/doctor/{doctorId}")
    @org.springframework.transaction.annotation.Transactional
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Set doctor availability", description = "Create or update availability for a specific day")
    public ResponseEntity<DoctorAvailability> setAvailability(
            @PathVariable("doctorId") Long doctorId,
            @RequestBody Map<String, Object> request) {
            
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        
        String dayOfWeekStr = (String) request.get("dayOfWeek");
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(dayOfWeekStr.toUpperCase());
        
        DoctorAvailability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
                .orElse(new DoctorAvailability());
                
        availability.setDoctor(doctor);
        availability.setDayOfWeek(dayOfWeek);
        
        String startTimeStr = (String) request.get("startTime");
        String endTimeStr = (String) request.get("endTime");
        
        // Handle HH:mm or HH:mm:ss
        availability.setStartTime(LocalTime.parse(startTimeStr.length() == 5 ? startTimeStr + ":00" : startTimeStr));
        availability.setEndTime(LocalTime.parse(endTimeStr.length() == 5 ? endTimeStr + ":00" : endTimeStr));
        
        if (availability.getStartTime().isAfter(availability.getEndTime()) || 
            availability.getStartTime().equals(availability.getEndTime())) {
            throw new com.hospital.exception.BadRequestException("End time must be after start time.");
        }
        
        if (request.containsKey("slotDurationMinutes")) {
            Object slotVal = request.get("slotDurationMinutes");
            if (slotVal instanceof Number) {
                availability.setSlotDurationMinutes(((Number) slotVal).intValue());
            } else if (slotVal instanceof String) {
                availability.setSlotDurationMinutes(Integer.parseInt((String) slotVal));
            }
        }
        
        if (request.containsKey("isAvailable")) {
            Object availVal = request.get("isAvailable");
            if (availVal instanceof Boolean) {
                availability.setAvailable((Boolean) availVal);
            } else if (availVal instanceof String) {
                availability.setAvailable(Boolean.parseBoolean((String) availVal));
            }
        }
        
        DoctorAvailability saved = availabilityRepository.save(availability);
        
        // Auto-generate slots for the next 30 days based on the updated rule
        timeSlotService.generateSlotsForNextDays(doctorId, 30);
        
        return ResponseEntity.ok(saved);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Delete availability slot", description = "Remove a specific availability configuration")
    public ResponseEntity<Void> deleteAvailability(@PathVariable("id") Long id) {
        DoctorAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorAvailability", "id", id));
        Long doctorId = availability.getDoctor().getId();
        
        availabilityRepository.deleteById(id);
        
        // Regenerate slots to reflect the removal of this rule
        timeSlotService.generateSlotsForNextDays(doctorId, 30);
        
        return ResponseEntity.ok().build();
    }
}
