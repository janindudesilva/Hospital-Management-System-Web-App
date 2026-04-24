package com.hospital.service.impl;

import com.hospital.dto.request.DepartmentRequest;
import com.hospital.dto.response.DepartmentResponse;
import com.hospital.dto.response.DoctorResponse;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest departmentRequest) {
        if (departmentRepository.existsByName(departmentRequest.getName())) {
            throw new RuntimeException("Department with this name already exists!");
        }
        
        Department department = new Department();
        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        Department savedDepartment = departmentRepository.save(department);
        return mapEntityToResponse(savedDepartment);
    }
    
    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest departmentRequest) {
        Department department = departmentRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        
        if (!department.getName().equals(departmentRequest.getName()) && 
            departmentRepository.existsByName(departmentRequest.getName())) {
            throw new RuntimeException("Department with this name already exists!");
        }
        
        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        Department updatedDepartment = departmentRepository.save(department);
        return mapEntityToResponse(updatedDepartment);
    }
    
    @Override
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapEntityToResponse(department);
    }
    
    @Override
    public List<DepartmentResponse> getAllDepartments() {
        List<Department> departments = departmentRepository.findActiveDepartments();
        return departments.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        departmentRepository.delete(department);
    }
    
    private DepartmentResponse mapEntityToResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getUpdatedAt());
        
        List<Doctor> doctors = doctorRepository.findByDepartmentId(department.getId());
        response.setDoctorCount(doctors.size());
        
        List<DoctorResponse> doctorResponses = doctors.stream()
                .map(doctor -> {
                    DoctorResponse doctorResponse = new DoctorResponse();
                    doctorResponse.setId(doctor.getId());
                    doctorResponse.setFullName(doctor.getFullName());
                    doctorResponse.setSpecialization(doctor.getSpecialization());
                    return doctorResponse;
                })
                .collect(Collectors.toList());
        response.setDoctors(doctorResponses);
        
        return response;
    }
}
