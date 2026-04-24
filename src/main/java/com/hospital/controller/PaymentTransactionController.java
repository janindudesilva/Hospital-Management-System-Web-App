package com.hospital.controller;

import com.hospital.dto.response.PaymentTransactionResponse;
import com.hospital.service.PaymentTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@Tag(name = "Payment Transactions", description = "Transaction history and payment tracking APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentTransactionController {

    @Autowired
    private PaymentTransactionService paymentTransactionService;

    @GetMapping("/bill/{billId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get transactions by bill", description = "Retrieve all payment transactions for a specific bill")
    public ResponseEntity<List<PaymentTransactionResponse>> getTransactionsByBillId(@PathVariable("billId") Long billId) {
        return ResponseEntity.ok(paymentTransactionService.getTransactionsByBillId(billId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Get transactions by patient", description = "Retrieve all payment transactions for a patient")
    public ResponseEntity<List<PaymentTransactionResponse>> getTransactionsByPatientId(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(paymentTransactionService.getTransactionsByPatientId(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get transaction by ID", description = "Retrieve a specific transaction")
    public ResponseEntity<PaymentTransactionResponse> getTransactionById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(paymentTransactionService.getTransactionById(id));
    }
}
