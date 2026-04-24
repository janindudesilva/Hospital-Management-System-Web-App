package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "disease_predictions")
@EqualsAndHashCode(callSuper = true, exclude = "patient")
@ToString(exclude = "patient")
public class DiseasePrediction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "predicted_category")
    private String predictedCategory;

    @Column(name = "recommended_specialist")
    private String recommendedSpecialist;

    private Double confidence;

    @Column(name = "prediction_date")
    private LocalDateTime predictionDate;

    @Column(name = "top_predictions", columnDefinition = "TEXT")
    private String topPredictions;
}
