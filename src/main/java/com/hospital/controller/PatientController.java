package com.hospital.controller;

import com.hospital.dto.request.PatientRequest;
import com.hospital.dto.response.PatientResponse;
import com.hospital.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@Tag(name = "Patient Management", description = "Patient management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {
    
    @Autowired
    private PatientService patientService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Create new patient", description = "Create a new patient in the system")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody PatientRequest patientRequest) {
        PatientResponse response = patientService.createPatient(patientRequest);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Update patient", description = "Update an existing patient's information")
    public ResponseEntity<PatientResponse> updatePatient(@PathVariable("id") Long id, 
                                                         @Valid @RequestBody PatientRequest patientRequest) {
        PatientResponse response = patientService.updatePatient(id, patientRequest);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get patient by ID", description = "Retrieve patient information by ID")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable("id") Long id) {
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get all patients", description = "Retrieve all patients in the system")
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        List<PatientResponse> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Search patients", description = "Search patients by name or phone")
    public ResponseEntity<Page<PatientResponse>> searchPatients(
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientResponse> patients = patientService.searchPatients(searchTerm, pageable);
        return ResponseEntity.ok(patients);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Get patient by user ID", description = "Retrieve patient information by user ID")
    public ResponseEntity<PatientResponse> getPatientByUserId(@PathVariable("userId") Long userId) {
        PatientResponse response = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get patients by doctor ID", description = "Retrieve all patients who have appointments with the specified doctor")
    public ResponseEntity<List<PatientResponse>> getPatientsByDoctorId(@PathVariable("doctorId") Long doctorId) {
        List<PatientResponse> patients = patientService.getPatientsByDoctorId(doctorId);
        return ResponseEntity.ok(patients);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete patient", description = "Soft delete a patient from the system")
    public ResponseEntity<Void> deletePatient(@PathVariable("id") Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok().build();
    }
}

