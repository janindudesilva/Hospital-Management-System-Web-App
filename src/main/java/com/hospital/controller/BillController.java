package com.hospital.controller;

import com.hospital.dto.request.BillRequest;
import com.hospital.dto.response.BillResponse;
import com.hospital.model.enums.PaymentStatus;
import com.hospital.service.BillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bills")
@Tag(name = "Billing Management", description = "Patient billing and payment APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BillController {

    @Autowired
    private BillService billService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Create new bill", description = "Generate a new bill for a patient")
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody BillRequest request) {
        return ResponseEntity.ok(billService.createBill(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Update bill", description = "Update billing details")
    public ResponseEntity<BillResponse> updateBill(@PathVariable("id") Long id, @Valid @RequestBody BillRequest request) {
        return ResponseEntity.ok(billService.updateBill(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Update payment status", description = "Mark a bill as PAID, UNPAID, etc.")
    public ResponseEntity<BillResponse> updatePaymentStatus(@PathVariable("id") Long id, @RequestParam("status") PaymentStatus status) {
        return ResponseEntity.ok(billService.updatePaymentStatus(id, status));
    }

    @PostMapping("/process-payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Process payment", description = "Finalize a bill payment using CARD or CASH")
    public ResponseEntity<BillResponse> processPayment(@Valid @RequestBody com.hospital.dto.request.ProcessPaymentRequest request) {
        return ResponseEntity.ok(billService.processPayment(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get bill by ID", description = "Retrieve a specific bill")
    public ResponseEntity<BillResponse> getBillById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'DOCTOR')")
    @Operation(summary = "Get bills by patient", description = "Retrieve all bills for a patient")
    public ResponseEntity<List<BillResponse>> getBillsByPatientId(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(billService.getBillsByPatientId(patientId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get bill by appointment", description = "Retrieve bill for a specific appointment")
    public ResponseEntity<BillResponse> getBillByAppointmentId(@PathVariable("appointmentId") Long appointmentId) {
        return ResponseEntity.ok(billService.getBillByAppointmentId(appointmentId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bill", description = "Soft delete a bill")
    public ResponseEntity<Void> deleteBill(@PathVariable("id") Long id) {
        billService.deleteBill(id);
        return ResponseEntity.ok().build();
    }
}
