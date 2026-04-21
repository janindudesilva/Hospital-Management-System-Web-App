package com.hospital.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.request.PredictionRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAIService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    public Optional<PredictionRequest> extractSymptoms(String userMessage) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("REPLACE_WITH_YOUR_KEY")) {
            log.warn("OpenAI API Key is not configured. Falling back to local keyword extraction.");
            return extractSymptomKeywords(userMessage);
        }

        try {
            String prompt = "Extract symptoms from the user message into a JSON format. " +
                    "Return ONLY valid JSON with fields: fever, cough, fatigue, difficulty_breathing (all as \"yes\" or \"no\"), " +
                    "age (number), gender (\"Male\" or \"Female\"), " +
                    "blood_pressure (\"Low\", \"Normal\", or \"High\"), " +
                    "cholesterol_level (\"Low\", \"Normal\", or \"High\"). " +
                    "If a symptom is not mentioned, use \"no\". If age is not mentioned, use 30. If gender not mentioned, use \"Male\". " +
                    "If BP/Cholesterol not mentioned, use \"Normal\".\n\n" +
                    "User Message: \"" + userMessage + "\"";

            Map<String, Object> request = new HashMap<>();
            request.put("model", model);
            request.put("messages", Arrays.asList(
                    Map.of("role", "system", "content", "You are a medical assistant that extracts structured symptom data from text into JSON."),
                    Map.of("role", "user", "content", prompt)
            ));
            request.put("response_format", Map.of("type", "json_object"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            JsonNode response = restTemplate.postForObject(apiUrl, entity, JsonNode.class);

            if (response != null && response.has("choices") && response.get("choices").size() > 0) {
                JsonNode choice = response.get("choices").get(0);
                if (choice.has("message")) {
                    String content = choice.get("message").path("content").asText("");
                    if (!content.isEmpty()) {
                        JsonNode symptomJson = objectMapper.readTree(content);

                        PredictionRequest sr = new PredictionRequest();
                        sr.setFever(symptomJson.path("fever").asText("no"));
                        sr.setCough(symptomJson.path("cough").asText("no"));
                        sr.setFatigue(symptomJson.path("fatigue").asText("no"));
                        sr.setDifficulty_breathing(symptomJson.path("difficulty_breathing").asText("no"));
                        sr.setAge(symptomJson.path("age").asInt(30));
                        sr.setGender(symptomJson.path("gender").asText("Male"));
                        sr.setBlood_pressure(symptomJson.path("blood_pressure").asText("Normal"));
                        sr.setCholesterol_level(symptomJson.path("cholesterol_level").asText("Normal"));

                        return Optional.of(sr);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract symptoms using OpenAI: {}", e.getMessage());
        }

        return extractSymptomKeywords(userMessage);
    }

    private Optional<PredictionRequest> extractSymptomKeywords(String text) {
        String lower = text.toLowerCase();
        boolean hasFever = lower.contains("fever") || lower.contains("hot") || lower.contains("temperature");
        boolean hasCough = lower.contains("cough") || lower.contains("throat");
        boolean hasFatigue = lower.contains("tired") || lower.contains("fatigue") || lower.contains("weak");
        boolean hasBreathing = lower.contains("breath") || lower.contains("shortness") || lower.contains("breathing");

        if (!hasFever && !hasCough && !hasFatigue && !hasBreathing) {
            return Optional.empty();
        }

        PredictionRequest sr = new PredictionRequest();
        sr.setFever(hasFever ? "yes" : "no");
        sr.setCough(hasCough ? "yes" : "no");
        sr.setFatigue(hasFatigue ? "yes" : "no");
        sr.setDifficulty_breathing(hasBreathing ? "yes" : "no");
        sr.setAge(30);
        sr.setGender("Male");
        sr.setBlood_pressure("Normal");
        sr.setCholesterol_level("Normal");
        return Optional.of(sr);
    }
}
