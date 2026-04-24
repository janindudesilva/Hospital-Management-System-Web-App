package com.hospital.dto.response;

import com.hospital.model.enums.AppointmentStatus;
import com.hospital.model.enums.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime appointmentDate;
    private String timeSlot;
    private Long slotId;
    private AppointmentStatus status;
    private AppointmentType type;
    private String symptoms;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long prescriptionId;
    private Long billId;

}
