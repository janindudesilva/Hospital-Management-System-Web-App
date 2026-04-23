package com.hospital.model;

import com.hospital.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_transactions")
@EqualsAndHashCode(callSuper = true)
public class PaymentTransaction extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;
    
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    @Column(name = "payment_method")
    private String paymentMethod; // CARD, CASH, etc.
    
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status; // SUCCESS, FAILED
    
    @Column(name = "reference_number")
    private String referenceNumber;
    
    @Column(name = "notes")
    private String notes;
}
