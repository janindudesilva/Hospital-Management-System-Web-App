package com.hospital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.BillRepository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics and overview APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private BillRepository billRepository;
    
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    @Operation(summary = "Get dashboard statistics", description = "Retrieve overall system statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        statistics.put("totalPatients", patientRepository.findActivePatients().size());
        statistics.put("totalDoctors", doctorRepository.findActiveDoctors().size());
        statistics.put("totalDepartments", departmentRepository.findActiveDepartments().size());
        statistics.put("totalAppointments", appointmentRepository.findActiveAppointments().size());
        
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        
        statistics.put("totalRevenue", billRepository.getTotalRevenueBetweenDates(monthStart, today));
        
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard data", description = "Retrieve admin-specific dashboard data")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalPatients", patientRepository.findActivePatients().size());
        dashboard.put("totalDoctors", doctorRepository.findActiveDoctors().size());
        dashboard.put("totalDepartments", departmentRepository.findActiveDepartments().size());
        dashboard.put("totalAppointments", appointmentRepository.findActiveAppointments().size());
        
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        dashboard.put("monthlyRevenue", billRepository.getTotalRevenueBetweenDates(monthStart, today));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Get doctor dashboard", description = "Retrieve doctor-specific dashboard data")
    public ResponseEntity<Map<String, Object>> getDoctorDashboard(@PathVariable("doctorId") Long doctorId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalAppointments", appointmentRepository.findByDoctorId(doctorId).size());
        dashboard.put("upcomingAppointments", appointmentRepository.findUpcomingAppointments(java.time.LocalDateTime.now()).size());
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/receptionist")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Get receptionist dashboard", description = "Retrieve receptionist-specific dashboard data")
    public ResponseEntity<Map<String, Object>> getReceptionistDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalPatients", patientRepository.findActivePatients().size());
        dashboard.put("totalAppointments", appointmentRepository.findActiveAppointments().size());
        dashboard.put("upcomingAppointments", appointmentRepository.findUpcomingAppointments(java.time.LocalDateTime.now()).size());
        
        return ResponseEntity.ok(dashboard);
    }
}
