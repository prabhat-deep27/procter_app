package com.procter.procter_app.dto;

import com.procter.procter_app.model.Question;
import java.time.Instant;
import java.util.List;

public class CreateTestRequest {

    private String title;
    private String subject; // Added
    private Instant scheduledAt;
    private int durationInMinutes; // Added
    private List<Question> questions;

    // --- Getters and Setters for all fields ---

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(int durationInMinutes) { this.durationInMinutes = durationInMinutes; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
