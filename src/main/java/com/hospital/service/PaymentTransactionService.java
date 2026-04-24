package com.hospital.service;

import com.hospital.dto.response.PaymentTransactionResponse;

import java.util.List;

public interface PaymentTransactionService {
    List<PaymentTransactionResponse> getTransactionsByBillId(Long billId);
    List<PaymentTransactionResponse> getTransactionsByPatientId(Long patientId);
    PaymentTransactionResponse getTransactionById(Long id);
}
