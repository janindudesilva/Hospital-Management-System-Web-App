package com.hospital.service;

import com.hospital.dto.request.PaymentCardRequest;
import com.hospital.dto.response.PaymentCardResponse;

import java.util.List;

public interface PaymentCardService {
    PaymentCardResponse addCard(PaymentCardRequest request);
    List<PaymentCardResponse> getCardsByPatientId(Long patientId);
    PaymentCardResponse getCardById(Long id);
    PaymentCardResponse updateCard(Long id, PaymentCardRequest request);
    void deleteCard(Long id);
    void setDefaultCard(Long cardId, Long patientId);
}
