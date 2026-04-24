package com.hospital.dto.response;

import com.hospital.model.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BillResponse {

    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private BigDecimal doctorFee;
    private BigDecimal labFee;
    private BigDecimal medicineFee;
    private BigDecimal otherCharges;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private LocalDate paymentDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
