package com.hospital.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "payment_cards")
@EqualsAndHashCode(callSuper = true)
public class PaymentCard extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(name = "card_holder_name", nullable = false)
    private String cardHolderName;
    
    @Column(name = "card_number_masked", nullable = false)
    private String cardNumberMasked;
    
    @Column(name = "expiry_date", nullable = false)
    private String expiryDate; // MM/YY
    
    @Column(name = "card_type")
    private String cardType; // VISA, MASTERCARD, etc.
    
    @Column(name = "is_default")
    private boolean isDefault = false;
    
    @Column(name = "card_token")
    private String cardToken; // Simulated token for secure payments
}
