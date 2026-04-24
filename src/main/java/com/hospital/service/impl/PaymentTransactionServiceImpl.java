package com.hospital.service.impl;

import com.hospital.dto.response.PaymentTransactionResponse;
import com.hospital.model.PaymentTransaction;
import com.hospital.repository.PaymentTransactionRepository;
import com.hospital.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public List<PaymentTransactionResponse> getTransactionsByBillId(Long billId) {
        return paymentTransactionRepository.findByBillIdAndDeletedFalse(billId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentTransactionResponse> getTransactionsByPatientId(Long patientId) {
        return paymentTransactionRepository.findByBill_Patient_IdAndDeletedFalse(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentTransactionResponse getTransactionById(Long id) {
        return paymentTransactionRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    private PaymentTransactionResponse mapToResponse(PaymentTransaction transaction) {
        PaymentTransactionResponse response = new PaymentTransactionResponse();
        response.setId(transaction.getId());
        response.setBillId(transaction.getBill().getId());
        response.setAmount(transaction.getAmount());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setStatus(transaction.getStatus());
        response.setReferenceNumber(transaction.getReferenceNumber());
        response.setNotes(transaction.getNotes());
        return response;
    }
}
