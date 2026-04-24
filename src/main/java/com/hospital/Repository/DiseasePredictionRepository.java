package com.hospital.repository;

import com.hospital.model.DiseasePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseasePredictionRepository extends JpaRepository<DiseasePrediction, Long> {
    List<DiseasePrediction> findByPatientIdOrderByPredictionDateDesc(Long patientId);
}
