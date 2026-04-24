package com.hospital.dto.request;

import com.hospital.model.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private BigDecimal doctorFee;

    private BigDecimal labFee;

    private BigDecimal medicineFee;

    private BigDecimal otherCharges;

    private BigDecimal discountAmount;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String paymentMethod;

    private LocalDate paymentDate;

    private String notes;

}
