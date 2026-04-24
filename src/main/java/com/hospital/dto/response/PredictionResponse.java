package com.hospital.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PredictionResponse {
    private Long id;
    private Long patientId;
    private String symptoms;
    private String predictedCategory;
    private String recommendedSpecialist;
    private Double confidence;
    private LocalDateTime predictionDate;
    private String topPredictions;
}
