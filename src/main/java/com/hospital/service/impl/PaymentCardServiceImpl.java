package com.hospital.service.impl;

import com.hospital.dto.request.PaymentCardRequest;
import com.hospital.dto.response.PaymentCardResponse;
import com.hospital.model.Patient;
import com.hospital.model.PaymentCard;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PaymentCardRepository;
import com.hospital.service.PaymentCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentCardServiceImpl implements PaymentCardService {

    @Autowired
    private PaymentCardRepository paymentCardRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    @Transactional
    public PaymentCardResponse addCard(PaymentCardRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (request.isDefault()) {
            resetDefaultCards(request.getPatientId());
        }

        PaymentCard card = new PaymentCard();
        card.setPatient(patient);
        card.setCardHolderName(request.getCardHolderName());
        card.setCardNumberMasked(maskCardNumber(request.getCardNumber()));
        card.setExpiryDate(request.getExpiryDate());
        card.setCardType(request.getCardType());
        card.setDefault(request.isDefault());
        card.setCardToken(UUID.randomUUID().toString()); // Simulated tokenization

        return mapToResponse(paymentCardRepository.save(card));
    }

    @Override
    public List<PaymentCardResponse> getCardsByPatientId(Long patientId) {
        return paymentCardRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentCardResponse getCardById(Long id) {
        return paymentCardRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Card not found"));
    }

    @Override
    @Transactional
    public PaymentCardResponse updateCard(Long id, PaymentCardRequest request) {
        PaymentCard card = paymentCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        if (request.isDefault() && !card.isDefault()) {
            resetDefaultCards(card.getPatient().getId());
        }

        card.setCardHolderName(request.getCardHolderName());
        card.setExpiryDate(request.getExpiryDate());
        card.setDefault(request.isDefault());
        
        // Note: Card number and Type usually don't change for security reasons
        // But if provided and different, we update (re-tokenization would happen here)

        return mapToResponse(paymentCardRepository.save(card));
    }

    @Override
    @Transactional
    public void deleteCard(Long id) {
        paymentCardRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void setDefaultCard(Long cardId, Long patientId) {
        resetDefaultCards(patientId);
        PaymentCard card = paymentCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setDefault(true);
        paymentCardRepository.save(card);
    }

    private void resetDefaultCards(Long patientId) {
        List<PaymentCard> defaultCards = paymentCardRepository.findByPatientIdAndIsDefaultTrue(patientId);
        for (PaymentCard card : defaultCards) {
            card.setDefault(false);
            paymentCardRepository.save(card);
        }
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    private PaymentCardResponse mapToResponse(PaymentCard card) {
        PaymentCardResponse response = new PaymentCardResponse();
        response.setId(card.getId());
        response.setPatientId(card.getPatient().getId());
        response.setCardHolderName(card.getCardHolderName());
        response.setCardNumberMasked(card.getCardNumberMasked());
        response.setExpiryDate(card.getExpiryDate());
        response.setCardType(card.getCardType());
        response.setDefault(card.isDefault());
        return response;
    }
}
