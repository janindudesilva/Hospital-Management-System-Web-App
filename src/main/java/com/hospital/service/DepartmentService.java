package com.hospital.service;

import com.hospital.dto.request.DepartmentRequest;
import com.hospital.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {
    
    DepartmentResponse createDepartment(DepartmentRequest departmentRequest);
    
    DepartmentResponse updateDepartment(Long id, DepartmentRequest departmentRequest);
    
    DepartmentResponse getDepartmentById(Long id);
    
    List<DepartmentResponse> getAllDepartments();
    
    void deleteDepartment(Long id);
    
}
