package com.hospital.controller;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.response.AppointmentResponse;
import com.hospital.model.enums.AppointmentStatus;
import com.hospital.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@Tag(name = "Appointment Management", description = "Appointment management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Create new appointment", description = "Book a new appointment")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest) {
        AppointmentResponse response = appointmentService.createAppointment(appointmentRequest);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    @Operation(summary = "Update appointment", description = "Update an existing appointment")
    public ResponseEntity<AppointmentResponse> updateAppointment(@PathVariable("id") Long id, 
                                                                 @Valid @RequestBody AppointmentRequest appointmentRequest) {
        AppointmentResponse response = appointmentService.updateAppointment(id, appointmentRequest);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get appointment by ID", description = "Retrieve appointment information by ID")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable("id") Long id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get all appointments", description = "Retrieve all appointments in the system")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get appointments by patient", description = "Retrieve appointments by patient ID")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatientId(@PathVariable("patientId") Long patientId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get appointments by doctor", description = "Retrieve appointments by doctor ID")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctorId(@PathVariable("doctorId") Long doctorId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get upcoming appointments", description = "Retrieve all upcoming appointments")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getUpcomingAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Update appointment status", description = "Update the status of an appointment")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(@PathVariable("id") Long id, 
                                                                      @RequestParam("status") AppointmentStatus status) {
        AppointmentResponse response = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Check time slot availability", description = "Check if a time slot is available for a doctor")
    public ResponseEntity<Boolean> checkTimeSlotAvailability(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("appointmentDate") String appointmentDate,
            @RequestParam("timeSlot") String timeSlot) {
        boolean available = appointmentService.isTimeSlotAvailable(doctorId, java.time.LocalDateTime.parse(appointmentDate), timeSlot);
        return ResponseEntity.ok(available);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Cancel appointment", description = "Cancel (soft delete) an appointment and free any booked slot")
    public ResponseEntity<Void> deleteAppointment(@PathVariable("id") Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok().build();
    }
}
