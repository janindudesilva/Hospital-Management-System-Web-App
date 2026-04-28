package com.hospital.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DoctorResponse {
    
    private Long id;
    private String fullName;
    private String specialization;
    private String qualification;
    private String experience;
    private String phone;
    private String email;
    private BigDecimal consultationFee;
    private String availableFrom;
    private String availableTo;
    private Integer maxPatientsPerDay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long departmentId;
    private String departmentName;
    private Long userId;
    private String username;
    private Boolean userEnabled;
    
}
