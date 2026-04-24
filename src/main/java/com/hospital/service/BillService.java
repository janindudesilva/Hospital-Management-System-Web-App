package com.hospital.service;

import com.hospital.dto.request.BillRequest;
import com.hospital.dto.response.BillResponse;
import com.hospital.model.enums.PaymentStatus;

import java.util.List;

public interface BillService {

    BillResponse createBill(BillRequest request);

    BillResponse updateBill(Long id, BillRequest request);

    BillResponse getBillById(Long id);

    List<BillResponse> getBillsByPatientId(Long patientId);

    BillResponse getBillByAppointmentId(Long appointmentId);

    BillResponse updatePaymentStatus(Long id, PaymentStatus status);

    BillResponse processPayment(com.hospital.dto.request.ProcessPaymentRequest request);

    void deleteBill(Long id);

}
