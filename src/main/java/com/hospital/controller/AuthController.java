package com.hospital.controller;

import com.hospital.dto.request.LoginRequest;
import com.hospital.dto.request.RegisterRequest;
import com.hospital.dto.response.JwtResponse;
import com.hospital.security.UserDetailsImpl;
import com.hospital.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Authenticate a user with username and password")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Register a new user in the system")
    public ResponseEntity<JwtResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        JwtResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/delete-profile")
    @Operation(summary = "Delete profile", description = "Delete the currently authenticated user's profile")
    public ResponseEntity<Void> deleteProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        authService.deleteUserAccount(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
