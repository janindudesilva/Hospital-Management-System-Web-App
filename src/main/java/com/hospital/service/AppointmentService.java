package com.hospital.service;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.response.AppointmentResponse;
import com.hospital.model.enums.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {
    
    AppointmentResponse createAppointment(AppointmentRequest appointmentRequest);
    
    AppointmentResponse updateAppointment(Long id, AppointmentRequest appointmentRequest);
    
    AppointmentResponse getAppointmentById(Long id);
    
    List<AppointmentResponse> getAllAppointments();
    
    List<AppointmentResponse> getAppointmentsByPatientId(Long patientId);
    
    List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId);
    
    List<AppointmentResponse> getUpcomingAppointments();
    
    AppointmentResponse updateAppointmentStatus(Long id, AppointmentStatus status);
    
    void deleteAppointment(Long id);
    
    boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDate, String timeSlot);
    
}
