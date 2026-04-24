package com.hospital.dto.response;

import com.hospital.model.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentTransactionResponse {
    private Long id;
    private Long billId;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime transactionDate;
    private PaymentStatus status;
    private String referenceNumber;
    private String notes;
}
