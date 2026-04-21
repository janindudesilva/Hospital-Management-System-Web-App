package com.hospital.controller;

import com.hospital.dto.request.ChatRequest;
import com.hospital.dto.request.PredictionRequest;
import com.hospital.dto.response.ChatResponse;
import com.hospital.dto.response.PredictionResponse;
import com.hospital.service.DiseasePredictionService;
import com.hospital.service.OpenAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatbotController {

    private final OpenAIService openAIService;
    private final DiseasePredictionService diseasePredictionService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> handleMessage(@RequestBody ChatRequest request) {
        log.info("Chatbot session for message: {}", request.getMessage());

        String message = request.getMessage().toLowerCase();
        Optional<PredictionRequest> symptomData = openAIService.extractSymptoms(request.getMessage());

        if (symptomData.isPresent()) {
            try {
                PredictionRequest pr = symptomData.get();
                pr.setPatientId(request.getPatientId());
                PredictionResponse prediction = diseasePredictionService.predictDisease(pr);

                String responseBody = "I've analyzed the symptoms you mentioned. Based on the data, the AI predicts a potential " +
                        prediction.getPredictedCategory() + " issue with " +
                        (prediction.getConfidence() * 100) + "% confidence. " +
                        "I recommend consulting a " + prediction.getRecommendedSpecialist() + " for further review.";

                return ResponseEntity.ok(ChatResponse.builder()
                        .response(responseBody)
                        .prediction(prediction)
                        .predictionTriggered(true)
                        .build());
            } catch (Exception e) {
                log.error("AI Prediction failed during chat: ", e);
                return ResponseEntity.ok(ChatResponse.builder()
                        .response("I detected some symptoms, but I'm having trouble connecting to the disease analysis engine right now. Please try again or visit our Symptom Checker page.")
                        .predictionTriggered(false)
                        .build());
            }
        }

        // Default conversational response if no symptoms detected
        String response = "Hello! I'm your HMS Health Assistant. You can describe your symptoms to me (e.g., 'I have a fever and cough'), and I'll provide an AI-based assessment for you. How can I help today?";
        if (message.contains("hi") || message.contains("hello")) {
            response = "Hi there! I'm here to help with symptom checks and simple health queries. What's on your mind?";
        } else if (message.contains("thank")) {
            response = "You're very welcome! If you have any more symptoms to check, just let me know.";
        }

        return ResponseEntity.ok(ChatResponse.builder()
                .response(response)
                .predictionTriggered(false)
                .build());
    }
}
