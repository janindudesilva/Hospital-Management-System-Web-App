package com.hospital.repository;

import com.hospital.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByBillIdAndDeletedFalse(Long billId);
    List<PaymentTransaction> findByBill_Patient_IdAndDeletedFalse(Long patientId);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM payment_transactions WHERE bill_id = :billId", nativeQuery = true)
    void forceHardDeleteByBillId(@Param("billId") Long billId);
}
