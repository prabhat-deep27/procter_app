package com.procter.procter_app.dto;

import java.util.List;

public class SubmitAttemptRequest {
    // Each entry can be a number (single choice), list of numbers (multi), or string (text)
    private List<Object> answers;
    private Integer durationInMinutes;

    public List<Object> getAnswers() { return answers; }
    public void setAnswers(List<Object> answers) { this.answers = answers; }

    public Integer getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(Integer durationInMinutes) { this.durationInMinutes = durationInMinutes; }
}


