package com.procter.procter_app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document("test_attempts")
public class TestAttempt {
    @Id
    private String id;
    
    private String testId;
    private String studentId;
    private String testTitle;
    private String subject;
    private String joinCode;
    private Instant completedAt;
    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int durationInMinutes;
    private List<Map<String, Object>> answers; // Store student's answers
    private boolean isCompleted;
    
    // Constructors
    public TestAttempt() {}
    
    public TestAttempt(String testId, String studentId, String testTitle, String subject, String joinCode) {
        this.testId = testId;
        this.studentId = studentId;
        this.testTitle = testTitle;
        this.subject = subject;
        this.joinCode = joinCode;
        this.isCompleted = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getTestTitle() { return testTitle; }
    public void setTestTitle(String testTitle) { this.testTitle = testTitle; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
    
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    
    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
    
    public int getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(int durationInMinutes) { this.durationInMinutes = durationInMinutes; }
    
    public List<Map<String, Object>> getAnswers() { return answers; }
    public void setAnswers(List<Map<String, Object>> answers) { this.answers = answers; }
    
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
}
