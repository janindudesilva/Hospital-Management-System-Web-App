package com.hospital.service.impl;

import com.hospital.dto.request.PatientRequest;
import com.hospital.dto.response.PatientResponse;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /*
     * Task List:
     * - [x] Backend: Add `nicPassport` field to `Patient` entity
     * - [x] Backend: Add `nicPassport` field to `PatientRequest` DTO
     * - [x] Backend: Add `nicPassport` field to `PatientResponse` DTO
     * - [x] Backend: Update `PatientServiceImpl` to map the `nicPassport` field
     */
    @Override
    @Transactional
    public PatientResponse createPatient(PatientRequest patientRequest) {
        Patient patient = new Patient();
        mapRequestToEntity(patientRequest, patient);
        
        if (patientRequest.getUserId() != null) {
            User user = userRepository.findById(patientRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientRequest.getUserId()));
            patient.setUser(user);
        }
        
        Patient savedPatient = patientRepository.save(patient);
        return mapEntityToResponse(savedPatient);
    }
    
    @Override
    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest patientRequest) {
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        
        mapRequestToEntity(patientRequest, patient);
        
        if (patientRequest.getUserId() != null) {
            User user = userRepository.findById(patientRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientRequest.getUserId()));
            patient.setUser(user);
        }
        
        Patient updatedPatient = patientRepository.save(patient);
        return mapEntityToResponse(updatedPatient);
    }
    
    @Override
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return mapEntityToResponse(patient);
    }
    
    @Override
    public List<PatientResponse> getAllPatients() {
        List<Patient> patients = patientRepository.findActivePatients();
        return patients.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<PatientResponse> searchPatients(String searchTerm, Pageable pageable) {
        Pageable searchPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Patient> patients = patientRepository.searchPatients(searchTerm, searchPageable);
        return patients.map(this::mapEntityToResponse);
    }
    
    @Override
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patient.setDeleted(true);
        patientRepository.save(patient);
    }
    
    @Override
    @Transactional
    public PatientResponse getPatientByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }
        return patientRepository.findByUserId(userId)
                .map(this::mapEntityToResponse)
                .orElseGet(() -> {
                    // Check if the user exists and has ROLE_PATIENT
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    
                    if (user.getRole() == com.hospital.model.enums.Role.ROLE_PATIENT) {
                        // Auto-create missing patient profile for existing user
                        Patient patient = new Patient();
                        patient.setFullName(user.getUsername());
                        patient.setPhone(user.getPhone());
                        patient.setUser(user);
                        Patient saved = patientRepository.save(patient);
                        return mapEntityToResponse(saved);
                    } else {
                        throw new ResourceNotFoundException("Patient", "userId", userId);
                    }
                });
    }
    
    @Override
    @Transactional
    public void deletePatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
        patient.setDeleted(true);
        patientRepository.save(patient);
    }
    
    @Override
    public List<PatientResponse> getPatientsByDoctorId(Long doctorId) {
        return patientRepository.findAllByDoctorId(doctorId).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    private void mapRequestToEntity(PatientRequest request, Patient patient) {
        patient.setFullName(request.getFullName());
        patient.setNicPassport(request.getNicPassport());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setMedicalHistory(request.getMedicalHistory());
    }
    
    private PatientResponse mapEntityToResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setFullName(patient.getFullName());
        response.setNicPassport(patient.getNicPassport());
        response.setAge(patient.getAge());
        response.setGender(patient.getGender());
        response.setPhone(patient.getPhone());
        response.setAddress(patient.getAddress());
        response.setBloodGroup(patient.getBloodGroup());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setEmergencyContact(patient.getEmergencyContact());
        response.setMedicalHistory(patient.getMedicalHistory());
        response.setCreatedAt(patient.getCreatedAt());
        response.setUpdatedAt(patient.getUpdatedAt());
        
        if (patient.getUser() != null) {
            response.setUserId(patient.getUser().getId());
            response.setUsername(patient.getUser().getUsername());
            response.setEmail(patient.getUser().getEmail());
        }
        
        return response;
    }
}
