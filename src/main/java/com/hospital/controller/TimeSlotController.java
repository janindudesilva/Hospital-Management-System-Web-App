package com.hospital.controller;

import com.hospital.model.TimeSlot;
import com.hospital.model.enums.SlotStatus;
import com.hospital.service.TimeSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/timeslots")
@Tag(name = "Time Slots", description = "APIs for fetching and managing explicit time slots")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimeSlotController {

    @Autowired
    private TimeSlotService timeSlotService;

    @GetMapping("/available")
    @Operation(summary = "Get available slots", description = "Get available slots for a doctor on a specific date")
    public ResponseEntity<List<TimeSlot>> getAvailableSlots(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timeSlotService.getAvailableSlots(doctorId, date));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get all slots for a date", description = "Get both available and booked/blocked slots for management")
    public ResponseEntity<List<TimeSlot>> getSlotsByDoctorAndDate(
            @PathVariable("doctorId") Long doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timeSlotService.getSlotsByDoctorAndDate(doctorId, date));
    }
    
    @GetMapping("/doctor/{doctorId}/range")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get slots by date range", description = "Get slots spanning multiple days")
    public ResponseEntity<List<TimeSlot>> getSlotsByDoctorAndDateRange(
            @PathVariable("doctorId") Long doctorId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(timeSlotService.getSlotsByDoctorAndDateRange(doctorId, startDate, endDate));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Update slot status", description = "Block or unblock a time slot directly")
    public ResponseEntity<TimeSlot> updateSlotStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {
        
        SlotStatus newStatus = SlotStatus.valueOf(request.get("status").toUpperCase());
        return ResponseEntity.ok(timeSlotService.updateSlotStatus(id, newStatus));
    }
    @PostMapping("/toggle")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Toggle slot availability", description = "Create or update a slot status by time")
    public ResponseEntity<TimeSlot> toggleSlot(@RequestBody Map<String, Object> request) {
        Long doctorId = Long.valueOf(request.get("doctorId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        LocalTime startTime = LocalTime.parse(request.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(request.get("endTime").toString());
        SlotStatus status = SlotStatus.valueOf(request.get("status").toString().toUpperCase());
        
        return ResponseEntity.ok(timeSlotService.toggleSlot(doctorId, date, startTime, endTime, status));
    }
}
