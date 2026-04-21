package com.hospital.service;

import com.hospital.dto.request.LoginRequest;
import com.hospital.dto.request.RegisterRequest;
import com.hospital.dto.response.JwtResponse;

public interface AuthService {
    
    JwtResponse authenticateUser(LoginRequest loginRequest);
    
    JwtResponse registerUser(RegisterRequest registerRequest);
    
    void deleteUserAccount(Long userId);
    
}
