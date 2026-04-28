package com.hospital.dto.response;

import com.hospital.model.enums.AppointmentType;
import lombok.Data;

@Data
public class TimeSlotResponse {
    private String time;
    private boolean isAvailable;
    private AppointmentType type;
}
