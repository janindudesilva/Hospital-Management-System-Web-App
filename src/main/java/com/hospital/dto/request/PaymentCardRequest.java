package com.hospital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PaymentCardRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Card holder name is required")
    private String cardHolderName;

    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "^[\\d\\*\\s]{16,20}$", message = "Invalid card number")
    private String cardNumber;

    @NotBlank(message = "Expiry date is required")
    @Pattern(regexp = "^(0[1-9]|1[0-2])\\/\\d{2}$", message = "Invalid expiry date (MM/YY)")
    private String expiryDate;

    @NotBlank(message = "CVV is required")
    @Pattern(regexp = "^[\\d\\*]{3,4}$", message = "Invalid CVV")
    private String cvv;

    private String cardType;
    
    private boolean isDefault;
}
