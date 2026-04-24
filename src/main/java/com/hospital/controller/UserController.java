package com.hospital.controller;

import com.hospital.model.User;
import com.hospital.model.enums.Role;
import com.hospital.repository.UserRepository;
import com.hospital.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "Admin APIs for managing system users, roles, and permissions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Retrieve a list of all users in the system")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Change the role of an existing user")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        try {
            Role newRole = Role.valueOf(request.get("role"));
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok().body(Map.of("message", "User role updated successfully", "newRole", newRole));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user status", description = "Enable or disable a user account")
    public ResponseEntity<?> toggleUserStatus(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        Boolean enabled = request.get("enabled");
        if (enabled != null) {
            user.setEnabled(enabled);
            userRepository.save(user);
            return ResponseEntity.ok().body(Map.of("message", "User status updated", "enabled", enabled));
        }
        return ResponseEntity.badRequest().body("Status 'enabled' boolean required");
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "Update user profile", description = "Update basic user details such as email and phone")
    public ResponseEntity<?> updateUserProfile(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if (request.containsKey("email")) {
            user.setEmail(request.get("email"));
        }
        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok().body(Map.of("message", "Profile updated successfully"));
    }
}
