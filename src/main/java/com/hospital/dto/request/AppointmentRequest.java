package com.hospital.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.hospital.model.enums.AppointmentType;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {

    @NotNull(message = "Patient is required")
    private Long patientId;

    @NotNull(message = "Doctor is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    private String timeSlot;

    private Long slotId;

    private String symptoms;

    private String notes;

    private AppointmentType type;

}
