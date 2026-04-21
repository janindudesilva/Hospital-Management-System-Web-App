package com.hospital.dto.response;

import com.hospital.model.enums.Role;
import lombok.Data;

@Data
public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String phone;
    private String address;
    private String dateOfBirth;
    
    public JwtResponse(String token, Long id, String username, String email, Role role, String phone, String address, String dateOfBirth) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
    }
    
}
