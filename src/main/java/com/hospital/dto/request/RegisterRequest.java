package com.hospital.dto.request;

import com.hospital.model.enums.Gender;
import com.hospital.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be less than or equal to 120")
    private Integer age;

    private Gender gender;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    private LocalDate dateOfBirth;

    // Doctor specific fields
    private Long departmentId;
    private String specialization;
    private String qualification;
    private String experience;
    private java.math.BigDecimal consultationFee;
}