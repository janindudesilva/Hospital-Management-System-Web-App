package com.hospital.service;

import com.hospital.dto.request.PatientRequest;
import com.hospital.dto.response.PatientResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PatientService {
    
    PatientResponse createPatient(PatientRequest patientRequest);
    
    PatientResponse updatePatient(Long id, PatientRequest patientRequest);
    
    PatientResponse getPatientById(Long id);
    
    List<PatientResponse> getAllPatients();
    
    Page<PatientResponse> searchPatients(String searchTerm, Pageable pageable);
    
    void deletePatient(Long id);
    
    PatientResponse getPatientByUserId(Long userId);
    
    void deletePatientByUserId(Long userId);
    
    List<PatientResponse> getPatientsByDoctorId(Long doctorId);
}
