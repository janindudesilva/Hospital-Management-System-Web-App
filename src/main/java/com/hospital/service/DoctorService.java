package com.hospital.service;

import com.hospital.dto.request.DoctorRequest;
import com.hospital.dto.response.DoctorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorService {

    DoctorResponse createDoctor(DoctorRequest doctorRequest);

    DoctorResponse updateDoctor(Long id, DoctorRequest doctorRequest);

    DoctorResponse getDoctorById(Long id);

    List<DoctorResponse> getAllDoctors();

    List<DoctorResponse> getDoctorsByDepartment(Long departmentId);

    Page<DoctorResponse> searchDoctors(String searchTerm, Pageable pageable);

    void deleteDoctor(Long id);

    DoctorResponse getDoctorByUserId(Long userId);

    void deleteDoctorByUserId(Long userId);
}