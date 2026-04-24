package com.hospital.dto.response;

import lombok.Data;

@Data
public class PaymentCardResponse {
    private Long id;
    private Long patientId;
    private String cardHolderName;
    private String cardNumberMasked;
    private String expiryDate;
    private String cardType;
    private boolean isDefault;
}
