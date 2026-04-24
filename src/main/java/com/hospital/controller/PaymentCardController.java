package com.hospital.controller;

import com.hospital.dto.request.PaymentCardRequest;
import com.hospital.dto.response.PaymentCardResponse;
import com.hospital.service.PaymentCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment-cards")
@Tag(name = "Payment Card Management", description = "Patient payment card storage APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentCardController {

    @Autowired
    private PaymentCardService paymentCardService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Add new payment card", description = "Store a new payment card for a patient")
    public ResponseEntity<PaymentCardResponse> addCard(@Valid @RequestBody PaymentCardRequest request) {
        return ResponseEntity.ok(paymentCardService.addCard(request));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Get cards by patient", description = "Retrieve all stored cards for a patient")
    public ResponseEntity<List<PaymentCardResponse>> getCardsByPatientId(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(paymentCardService.getCardsByPatientId(patientId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update card", description = "Update stored card details")
    public ResponseEntity<PaymentCardResponse> updateCard(@PathVariable("id") Long id, @Valid @RequestBody PaymentCardRequest request) {
        return ResponseEntity.ok(paymentCardService.updateCard(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Delete card", description = "Remove a stored card")
    public ResponseEntity<Void> deleteCard(@PathVariable("id") Long id) {
        paymentCardService.deleteCard(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/default")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Set default card", description = "Set a card as the default payment method")
    public ResponseEntity<Void> setDefaultCard(@PathVariable("id") Long id, @RequestParam("patientId") Long patientId) {
        paymentCardService.setDefaultCard(id, patientId);
        return ResponseEntity.ok().build();
    }
}
