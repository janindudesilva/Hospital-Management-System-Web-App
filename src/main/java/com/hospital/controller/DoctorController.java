package com.hospital.controller;

import com.hospital.dto.request.DoctorRequest;
import com.hospital.dto.response.DoctorResponse;
import com.hospital.service.DoctorService;
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
@RequestMapping("/doctors")
@Tag(name = "Doctor Management", description = "Doctor management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorController {
    
    @Autowired
    private DoctorService doctorService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new doctor", description = "Create a new doctor in the system")
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody DoctorRequest doctorRequest) {
        DoctorResponse response = doctorService.createDoctor(doctorRequest);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Update doctor", description = "Update an existing doctor's information")
    public ResponseEntity<DoctorResponse> updateDoctor(@PathVariable("id") Long id, 
                                                     @Valid @RequestBody DoctorRequest doctorRequest) {
        DoctorResponse response = doctorService.updateDoctor(id, doctorRequest);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get doctor by ID", description = "Retrieve doctor information by ID")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable("id") Long id) {
        DoctorResponse response = doctorService.getDoctorById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get all doctors", description = "Retrieve all doctors in the system")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get doctors by department", description = "Retrieve doctors by department ID")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByDepartment(@PathVariable("departmentId") Long departmentId) {
        List<DoctorResponse> doctors = doctorService.getDoctorsByDepartment(departmentId);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Search doctors", description = "Search doctors by name or specialization")
    public ResponseEntity<Page<DoctorResponse>> searchDoctors(
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DoctorResponse> doctors = doctorService.searchDoctors(searchTerm, pageable);
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Get doctor by user ID", description = "Retrieve doctor information by user ID")
    public ResponseEntity<DoctorResponse> getDoctorByUserId(@PathVariable("userId") Long userId) {
        DoctorResponse response = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete doctor", description = "Soft delete a doctor from the system")
    public ResponseEntity<Void> deleteDoctor(@PathVariable("id") Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok().build();
    }
}
