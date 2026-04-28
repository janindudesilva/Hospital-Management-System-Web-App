package com.hospital.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class DailyScheduleResponse {
    private LocalDate date;
    private List<TimeSlotResponse> slots;
}
