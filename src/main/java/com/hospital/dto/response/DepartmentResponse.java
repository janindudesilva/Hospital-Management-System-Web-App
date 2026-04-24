package com.hospital.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DepartmentResponse {
    
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer doctorCount;
    private List<DoctorResponse> doctors;
    
}
