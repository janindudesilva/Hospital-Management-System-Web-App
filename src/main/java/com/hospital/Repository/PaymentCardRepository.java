package com.hospital.repository;

import com.hospital.model.PaymentCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentCardRepository extends JpaRepository<PaymentCard, Long> {
    List<PaymentCard> findByPatientId(Long patientId);
    List<PaymentCard> findByPatientIdAndIsDefaultTrue(Long patientId);
}
