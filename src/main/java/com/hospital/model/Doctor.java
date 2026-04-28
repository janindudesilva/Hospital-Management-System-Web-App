package com.hospital.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "doctors")
@EqualsAndHashCode(callSuper = true)
public class Doctor extends BaseEntity {
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    private String specialization;
    
    private String qualification;
    
    private String experience;
    
    private String phone;
    
    private String email;
    
    @Column(name = "consultation_fee")
    private BigDecimal consultationFee;
    
    @Column(name = "available_from")
    private String availableFrom;
    
    @Column(name = "available_to")
    private String availableTo;
    
    @Column(name = "max_patients_per_day")
    private Integer maxPatientsPerDay;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Prescription> prescriptions;
    
}
