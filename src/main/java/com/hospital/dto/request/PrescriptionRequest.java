package com.hospital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PrescriptionRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String diagnosis;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String dosage;

    private String frequency;

    private LocalDate startDate;

    private LocalDate endDate;

    private String instructions;

    private String notes;

}
