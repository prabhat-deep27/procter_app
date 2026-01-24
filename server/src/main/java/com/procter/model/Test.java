package com.procter.procter_app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document("tests") // This is a top-level database document
public class Test {
    @Id
    private String id;

    // --- Fields from your form ---
    private String title;
    private String subject; // Added field
    private Instant scheduledAt;
    private int durationInMinutes; // Added field

    // --- System-generated and relationship fields ---
    private String createdByTeacherId;
    private String joinCode;
    private Set<String> participantIds = new HashSet<>();

    // The list of Question objects is embedded directly inside this document
    private List<Question> questions;

    // --- Getters and Setters for ALL fields ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; } // Added

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(int durationInMinutes) { this.durationInMinutes = durationInMinutes; } // Added

    public String getCreatedByTeacherId() { return createdByTeacherId; }
    public void setCreatedByTeacherId(String createdByTeacherId) { this.createdByTeacherId = createdByTeacherId; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public Set<String> getParticipantIds() { return participantIds; }
    public void setParticipantIds(Set<String> participantIds) { this.participantIds = participantIds; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
