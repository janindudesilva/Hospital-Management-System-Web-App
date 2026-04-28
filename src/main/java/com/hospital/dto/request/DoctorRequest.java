package com.hospital.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorRequest {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Specialization is required")
    private String specialization;
    
    private String qualification;
    
    private String experience;
    
    private String phone;
    
    private String email;
    
    @Positive(message = "Consultation fee must be positive")
    private BigDecimal consultationFee;
    
    private String availableFrom;
    
    private String availableTo;
    
    @Positive(message = "Max patients per day must be positive")
    private Integer maxPatientsPerDay;
    
    @NotNull(message = "Department is required")
    private Long departmentId;
    
    private Long userId;
    
}
