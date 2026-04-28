package com.hospital.service.impl;

import com.hospital.dto.request.DoctorRequest;
import com.hospital.dto.response.DoctorResponse;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public DoctorResponse createDoctor(DoctorRequest doctorRequest) {
        Doctor doctor = new Doctor();
        mapRequestToEntity(doctorRequest, doctor);

        Department department = departmentRepository.findActiveById(doctorRequest.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", doctorRequest.getDepartmentId()));
        doctor.setDepartment(department);

        if (doctorRequest.getUserId() != null) {
            User user = userRepository.findById(doctorRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorRequest.getUserId()));
            doctor.setUser(user);
        }

        Doctor savedDoctor = doctorRepository.save(doctor);
        return mapEntityToResponse(savedDoctor);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorRequest doctorRequest) {
        Doctor doctor = doctorRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        mapRequestToEntity(doctorRequest, doctor);

        if (doctorRequest.getDepartmentId() != null) {
            Department department = departmentRepository.findActiveById(doctorRequest.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", doctorRequest.getDepartmentId()));
            doctor.setDepartment(department);
        }

        if (doctorRequest.getUserId() != null) {
            User user = userRepository.findById(doctorRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", doctorRequest.getUserId()));
            doctor.setUser(user);
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return mapEntityToResponse(updatedDoctor);
    }

    @Override
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return mapEntityToResponse(doctor);
    }

    @Override
    public List<DoctorResponse> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findActiveDoctors();
        return doctors.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorResponse> getDoctorsByDepartment(Long departmentId) {
        List<Doctor> doctors = doctorRepository.findByDepartmentId(departmentId);
        return doctors.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<DoctorResponse> searchDoctors(String searchTerm, Pageable pageable) {
        Pageable searchPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Doctor> doctors = doctorRepository.searchDoctors(searchTerm, searchPageable);
        return doctors.map(this::mapEntityToResponse);
    }

    @Override
    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctorRepository.delete(doctor);
    }

    @Override
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId));
        return mapEntityToResponse(doctor);
    }

    @Override
    @Transactional
    public void deleteDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId));
        doctorRepository.delete(doctor);
    }

    private void mapRequestToEntity(DoctorRequest request, Doctor doctor) {
        doctor.setFullName(request.getFullName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setPhone(request.getPhone());
        doctor.setEmail(request.getEmail());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setAvailableFrom(request.getAvailableFrom());
        doctor.setAvailableTo(request.getAvailableTo());
        doctor.setMaxPatientsPerDay(request.getMaxPatientsPerDay());
    }

    private DoctorResponse mapEntityToResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setFullName(doctor.getFullName());
        response.setSpecialization(doctor.getSpecialization());
        response.setQualification(doctor.getQualification());
        response.setExperience(doctor.getExperience());
        response.setPhone(doctor.getPhone());
        response.setEmail(doctor.getEmail());
        response.setConsultationFee(doctor.getConsultationFee());
        response.setAvailableFrom(doctor.getAvailableFrom());
        response.setAvailableTo(doctor.getAvailableTo());
        response.setMaxPatientsPerDay(doctor.getMaxPatientsPerDay());
        response.setCreatedAt(doctor.getCreatedAt());
        response.setUpdatedAt(doctor.getUpdatedAt());

        if (doctor.getDepartment() != null) {
            response.setDepartmentId(doctor.getDepartment().getId());
            response.setDepartmentName(doctor.getDepartment().getName());
        }

        if (doctor.getUser() != null) {
            response.setUserId(doctor.getUser().getId());
            response.setUsername(doctor.getUser().getUsername());
            response.setUserEnabled(doctor.getUser().isEnabled());
        }

        return response;
    }
}