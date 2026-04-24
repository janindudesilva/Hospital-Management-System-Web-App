package com.hospital.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicalRecordResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDate recordDate;
    private String diagnosis;
    private String symptoms;
    private String treatment;
    private String notes;
    private LocalDate followUpDate;
    private Boolean isChronic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
