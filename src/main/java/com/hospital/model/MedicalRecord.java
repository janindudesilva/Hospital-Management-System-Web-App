package com.hospital.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "medical_records")
@EqualsAndHashCode(callSuper = true)
public class MedicalRecord extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;
    
    @Column(name = "diagnosis", nullable = false)
    private String diagnosis;
    
    @Column(columnDefinition = "TEXT")
    private String symptoms;
    
    @Column(columnDefinition = "TEXT")
    private String treatment;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    @Column(name = "is_chronic")
    private Boolean isChronic = false;
    
}
