package com.hospital.dto.request;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private Long patientId;
}
