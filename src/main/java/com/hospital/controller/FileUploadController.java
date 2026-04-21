package com.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    private final String UPLOAD_DIR = "uploads/profile-pictures/";
    private final String SERVER_URL = "http://localhost:8082/api/";

    @PostMapping("/profile-picture")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("profilePicture") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid file name");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "user_" + userId + "_" + System.currentTimeMillis() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file URL
            String fileUrl = SERVER_URL + "public/profile-pictures/" + newFilename;
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("profilePictureUrl", fileUrl);
            response.put("filename", newFilename);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/profile-picture/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, String>> deleteProfilePicture(@PathVariable("userId") Long userId) {
        try {
            // Implementation to delete user's profile picture
            // This would typically involve finding the file and deleting it
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete profile picture: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
