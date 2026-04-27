package com.hospital.dto.request;

import com.hospital.model.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequest {
    
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    private String nicPassport;
    
    private Integer age;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    private String phone;
    
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;
    
    private String bloodGroup;
    
    private String email;
    
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    private String emergencyContact;
    
    private String medicalHistory;
    
    private Long userId;
    
}
