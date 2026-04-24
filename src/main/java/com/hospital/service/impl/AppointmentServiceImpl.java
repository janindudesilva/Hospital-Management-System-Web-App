package com.hospital.service.impl;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.response.AppointmentResponse;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.enums.AppointmentStatus;
import com.hospital.model.TimeSlot;
import com.hospital.model.enums.SlotStatus;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.BillRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PaymentTransactionRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.TimeSlotRepository;
import com.hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private com.hospital.repository.DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private com.hospital.service.BillService billService;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest appointmentRequest) {
        Patient patient = patientRepository.findActiveById(appointmentRequest.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", appointmentRequest.getPatientId()));

        Doctor doctor = doctorRepository.findActiveById(appointmentRequest.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", appointmentRequest.getDoctorId()));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appointmentRequest.getAppointmentDate());
        
        if (appointmentRequest.getSlotId() != null) {
            TimeSlot slot = timeSlotRepository.findById(appointmentRequest.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("TimeSlot", "id", appointmentRequest.getSlotId()));
            
            if (!slot.getDoctor().getId().equals(doctor.getId())) {
                throw new BadRequestException("Selected slot does not belong to this doctor.");
            }

            if (!slot.getSlotDate().equals(appointmentRequest.getAppointmentDate().toLocalDate())) {
                throw new BadRequestException("Selected slot does not belong to the requested date.");
            }

            if (slot.getStatus() != SlotStatus.AVAILABLE) {
                throw new BadRequestException("This time slot is no longer available.");
            }
            
            // Mark as booked
            slot.setStatus(SlotStatus.BOOKED);
            timeSlotRepository.save(slot);
            
            appointment.setSlotId(slot.getId());
            appointment.setStartTime(slot.getSlotDate().atTime(slot.getStartTime()));
            appointment.setEndTime(slot.getSlotDate().atTime(slot.getEndTime()));
            // formatted representation for legacy compat
            appointment.setTimeSlot(slot.getStartTime().toString() + " - " + slot.getEndTime().toString());
        } else {
            // Legacy booking mechanism
            if (!isTimeSlotAvailable(doctor.getId(), appointmentRequest.getAppointmentDate(),
                    appointmentRequest.getTimeSlot())) {
                throw new BadRequestException("This time slot is already booked for the selected doctor");
            }
            appointment.setTimeSlot(appointmentRequest.getTimeSlot());
            try {
                java.time.LocalTime parsedTime = java.time.LocalTime.parse(appointmentRequest.getTimeSlot());
                LocalDateTime startTime = appointmentRequest.getAppointmentDate().toLocalDate().atTime(parsedTime);
                appointment.setStartTime(startTime);
                appointment.setEndTime(startTime.plusMinutes(30)); // Default 30 min slot
            } catch (Exception e) {
                appointment.setStartTime(appointmentRequest.getAppointmentDate());
                appointment.setEndTime(appointmentRequest.getAppointmentDate().plusMinutes(30));
            }
        }

        if (appointmentRequest.getType() != null) {
            appointment.setType(appointmentRequest.getType());
        }

        appointment.setSymptoms(appointmentRequest.getSymptoms());
        appointment.setNotes(appointmentRequest.getNotes());
        appointment.setStatus(AppointmentStatus.BOOKED);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Auto-generate bill
        com.hospital.dto.request.BillRequest billRequest = new com.hospital.dto.request.BillRequest();
        billRequest.setAppointmentId(savedAppointment.getId());
        billRequest.setPatientId(savedAppointment.getPatient().getId());
        billRequest.setDoctorFee(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : BigDecimal.ZERO);
        billRequest.setLabFee(BigDecimal.ZERO);
        billRequest.setMedicineFee(BigDecimal.ZERO);
        billRequest.setOtherCharges(BigDecimal.ZERO);
        billRequest.setDiscountAmount(BigDecimal.ZERO);
        billRequest.setPaymentStatus(com.hospital.model.enums.PaymentStatus.PENDING);
        billRequest.setNotes("Automatically generated for appointment #" + savedAppointment.getId());
        
        try {
            billService.createBill(billRequest);
        } catch (Exception e) {
            // Log error but don't fail appointment creation
            System.err.println("Failed to auto-generate bill: " + e.getMessage());
        }

        return mapEntityToResponse(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest appointmentRequest) {
        Appointment appointment = appointmentRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointmentRequest.getPatientId() != null) {
            Patient patient = patientRepository.findActiveById(appointmentRequest.getPatientId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Patient", "id", appointmentRequest.getPatientId()));
            appointment.setPatient(patient);
        }

        if (appointmentRequest.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findActiveById(appointmentRequest.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", appointmentRequest.getDoctorId()));
            appointment.setDoctor(doctor);
        }

        if (appointmentRequest.getAppointmentDate() != null && appointmentRequest.getTimeSlot() != null) {
            if (!isTimeSlotAvailable(appointmentRequest.getDoctorId(), appointmentRequest.getAppointmentDate(),
                    appointmentRequest.getTimeSlot())) {
                throw new BadRequestException("This time slot is already booked for the selected doctor");
            }
            appointment.setAppointmentDate(appointmentRequest.getAppointmentDate());
            appointment.setTimeSlot(appointmentRequest.getTimeSlot());
            
            try {
                java.time.LocalTime parsedTime = java.time.LocalTime.parse(appointmentRequest.getTimeSlot());
                LocalDateTime startTime = appointmentRequest.getAppointmentDate().toLocalDate().atTime(parsedTime);
                appointment.setStartTime(startTime);
                appointment.setEndTime(startTime.plusMinutes(30)); 
            } catch (Exception e) {
                appointment.setStartTime(appointmentRequest.getAppointmentDate());
                appointment.setEndTime(appointmentRequest.getAppointmentDate().plusMinutes(30));
            }
        }

        if (appointmentRequest.getType() != null) {
            appointment.setType(appointmentRequest.getType());
        }

        appointment.setSymptoms(appointmentRequest.getSymptoms());
        appointment.setNotes(appointmentRequest.getNotes());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapEntityToResponse(updatedAppointment);
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapEntityToResponse(appointment);
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findActiveAppointments();
        return appointments.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getUpcomingAppointments() {
        List<Appointment> appointments = appointmentRepository.findUpcomingAppointments(LocalDateTime.now());
        return appointments.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapEntityToResponse(updatedAppointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        // We use findById instead of findActiveById to allow deleting already soft-deleted records if needed
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        // Patients can only cancel their own appointments.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && auth.getAuthorities() != null
                && auth.getAuthorities().stream().anyMatch(a -> "ROLE_PATIENT".equals(a.getAuthority()))) {
            String username = auth.getName();
            String apptUsername = appointment.getPatient() != null && appointment.getPatient().getUser() != null
                    ? appointment.getPatient().getUser().getUsername()
                    : null;
            if (apptUsername == null || !apptUsername.equals(username)) {
                throw new BadRequestException("You can only cancel your own appointments.");
            }
        }

        // 1. Reset Time Slot status if it exists
        if (appointment.getSlotId() != null) {
            timeSlotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                slot.setStatus(SlotStatus.AVAILABLE);
                timeSlotRepository.save(slot);
            });
        }

        // 3. Force Hard delete associated Prescriptions
        prescriptionRepository.findByAppointmentId(appointment.getId()).ifPresent(prescription -> {
            prescriptionRepository.forceHardDelete(prescription.getId());
        });

        // 4. Force Hard delete associated Bill and Payment Transactions
        billRepository.findByAppointmentId(appointment.getId()).ifPresent(bill -> {
            // Delete payments first (child of bill)
            paymentTransactionRepository.forceHardDeleteByBillId(bill.getId());
            // Then delete bill
            billRepository.forceHardDelete(bill.getId());
        });

        // 5. Finally, force Hard delete the Appointment itself
        appointmentRepository.forceHardDelete(appointment.getId());
    }

    @Override
    public boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDate, String timeSlot) {
        // 1. Check if the doctor has a defined availability for this day of the week
        java.time.DayOfWeek dayOfWeek = appointmentDate.getDayOfWeek();
        java.time.LocalTime requestedTime;
        try {
            requestedTime = java.time.LocalTime.parse(timeSlot);
        } catch (Exception e) {
            return false;
        }

        java.util.Optional<com.hospital.model.DoctorAvailability> availabilityOpt = 
                availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
        
        if (availabilityOpt.isEmpty() || !availabilityOpt.get().isAvailable()) {
            return false; // Doctor not working this day or marked as unavailable
        }

        com.hospital.model.DoctorAvailability availability = availabilityOpt.get();
        if (requestedTime.isBefore(availability.getStartTime()) || requestedTime.isAfter(availability.getEndTime())) {
            return false; // Time is outside of working hours
        }

        // 2. Check for conflicting appointments
        LocalDateTime startTime = appointmentDate.toLocalDate().atTime(requestedTime);
        LocalDateTime endTime = startTime.plusMinutes(availability.getSlotDurationMinutes());
        
        List<Appointment> conflictingAppointments = appointmentRepository.findConflictingAppointments(
                doctorId, startTime, endTime);
        
        return conflictingAppointments.isEmpty();
    }

    private AppointmentResponse mapEntityToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setTimeSlot(appointment.getTimeSlot());
        response.setSlotId(appointment.getSlotId());
        response.setStatus(appointment.getStatus());
        response.setType(appointment.getType());
        response.setSymptoms(appointment.getSymptoms());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());

        if (appointment.getPatient() != null) {
            response.setPatientId(appointment.getPatient().getId());
            response.setPatientName(appointment.getPatient().getFullName());
        }

        if (appointment.getDoctor() != null) {
            response.setDoctorId(appointment.getDoctor().getId());
            response.setDoctorName(appointment.getDoctor().getFullName());
            response.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        }

        if (appointment.getPrescription() != null) {
            response.setPrescriptionId(appointment.getPrescription().getId());
        }

        if (appointment.getBill() != null) {
            response.setBillId(appointment.getBill().getId());
        }

        return response;
    }
}
