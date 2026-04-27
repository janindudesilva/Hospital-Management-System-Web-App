package com.hospital.dto.response;

import com.hospital.model.enums.Gender;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientResponse {
    
    private Long id;
    private String fullName;
    private String nicPassport;
    private Integer age;
    private Gender gender;
    private String phone;
    private String address;
    private String bloodGroup;
    private LocalDate dateOfBirth;
    private String emergencyContact;
    private String medicalHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String username;
    private String email;
    
}
