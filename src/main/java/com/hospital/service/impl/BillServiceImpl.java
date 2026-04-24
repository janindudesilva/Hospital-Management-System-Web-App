package com.hospital.service.impl;

import com.hospital.dto.request.BillRequest;
import com.hospital.dto.response.BillResponse;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Bill;
import com.hospital.model.Patient;
import com.hospital.model.enums.PaymentStatus;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.BillRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private com.hospital.repository.PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private com.hospital.repository.PaymentCardRepository paymentCardRepository;

    @Override
    @Transactional
    public BillResponse createBill(BillRequest request) {
        Appointment appointment = appointmentRepository.findActiveById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        Patient patient = patientRepository.findActiveById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Bill bill = new Bill();
        mapRequestToEntity(request, bill);
        bill.setAppointment(appointment);
        bill.setPatient(patient);

        calculateTotals(bill);

        Bill savedBill = billRepository.save(bill);
        return mapEntityToResponse(savedBill);
    }

    @Override
    @Transactional
    public BillResponse updateBill(Long id, BillRequest request) {
        Bill bill = billRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));

        mapRequestToEntity(request, bill);

        if (!bill.getAppointment().getId().equals(request.getAppointmentId())) {
            Appointment appointment = appointmentRepository.findActiveById(request.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));
            bill.setAppointment(appointment);
        }

        if (!bill.getPatient().getId().equals(request.getPatientId())) {
            Patient patient = patientRepository.findActiveById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));
            bill.setPatient(patient);
        }

        calculateTotals(bill);

        Bill updatedBill = billRepository.save(bill);
        return mapEntityToResponse(updatedBill);
    }

    @Override
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return mapEntityToResponse(bill);
    }

    @Override
    public List<BillResponse> getBillsByPatientId(Long patientId) {
        return billRepository.findByPatientId(patientId).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BillResponse getBillByAppointmentId(Long appointmentId) {
        Bill bill = billRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "appointmentId", appointmentId));
        return mapEntityToResponse(bill);
    }

    @Override
    @Transactional
    public BillResponse updatePaymentStatus(Long id, PaymentStatus status) {
        Bill bill = billRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        bill.setPaymentStatus(status);
        if (status == PaymentStatus.PAID) {
            bill.setPaymentDate(java.time.LocalDate.now());
        }
        Bill updatedBill = billRepository.save(bill);
        return mapEntityToResponse(updatedBill);
    }

    @Override
    @Transactional
    public BillResponse processPayment(com.hospital.dto.request.ProcessPaymentRequest request) {
        Bill bill = billRepository.findActiveById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", request.getBillId()));

        if (bill.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Bill is already paid");
        }

        if ("CARD".equalsIgnoreCase(request.getPaymentMethod()) && request.getPaymentCardId() != null) {
            paymentCardRepository.findById(request.getPaymentCardId())
                    .orElseThrow(() -> new RuntimeException("Payment card not found"));
        }

        // Logic for payment processing
        com.hospital.model.PaymentTransaction transaction = new com.hospital.model.PaymentTransaction();
        transaction.setBill(bill);
        transaction.setAmount(request.getAmount());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setTransactionDate(java.time.LocalDateTime.now());
        transaction.setStatus(PaymentStatus.PAID); // Simulated success
        transaction.setReferenceNumber("REF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setNotes(request.getNotes());

        paymentTransactionRepository.save(transaction);

        // Update bill status
        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setPaymentDate(java.time.LocalDate.now());
        
        Bill updatedBill = billRepository.save(bill);
        return mapEntityToResponse(updatedBill);
    }

    @Override
    @Transactional
    public void deleteBill(Long id) {
        Bill bill = billRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        bill.setDeleted(true);
        billRepository.save(bill);
    }

    private void calculateTotals(Bill bill) {
        BigDecimal total = BigDecimal.ZERO;
        total = total.add(bill.getDoctorFee() != null ? bill.getDoctorFee() : BigDecimal.ZERO);
        total = total.add(bill.getLabFee() != null ? bill.getLabFee() : BigDecimal.ZERO);
        total = total.add(bill.getMedicineFee() != null ? bill.getMedicineFee() : BigDecimal.ZERO);
        total = total.add(bill.getOtherCharges() != null ? bill.getOtherCharges() : BigDecimal.ZERO);

        bill.setTotalAmount(total);

        BigDecimal finalAmount = total
                .subtract(bill.getDiscountAmount() != null ? bill.getDiscountAmount() : BigDecimal.ZERO);
        bill.setFinalAmount(finalAmount.max(BigDecimal.ZERO));
    }

    private void mapRequestToEntity(BillRequest request, Bill bill) {
        bill.setDoctorFee(request.getDoctorFee());
        bill.setLabFee(request.getLabFee());
        bill.setMedicineFee(request.getMedicineFee());
        bill.setOtherCharges(request.getOtherCharges());
        bill.setDiscountAmount(request.getDiscountAmount());
        bill.setPaymentStatus(request.getPaymentStatus());
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setPaymentDate(request.getPaymentDate());
        bill.setNotes(request.getNotes());
    }

    private BillResponse mapEntityToResponse(Bill bill) {
        BillResponse response = new BillResponse();
        response.setId(bill.getId());
        response.setAppointmentId(bill.getAppointment().getId());
        response.setPatientId(bill.getPatient().getId());
        response.setPatientName(bill.getPatient().getFullName());
        response.setDoctorFee(bill.getDoctorFee());
        response.setLabFee(bill.getLabFee());
        response.setMedicineFee(bill.getMedicineFee());
        response.setOtherCharges(bill.getOtherCharges());
        response.setTotalAmount(bill.getTotalAmount());
        response.setDiscountAmount(bill.getDiscountAmount());
        response.setFinalAmount(bill.getFinalAmount());
        response.setPaymentStatus(bill.getPaymentStatus());
        response.setPaymentMethod(bill.getPaymentMethod());
        response.setPaymentDate(bill.getPaymentDate());
        response.setNotes(bill.getNotes());
        response.setCreatedAt(bill.getCreatedAt());
        response.setUpdatedAt(bill.getUpdatedAt());
        return response;
    }
}
