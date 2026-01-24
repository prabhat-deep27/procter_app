package com.procter.procter_app.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentAnalyticsRequest {
    @NotBlank
    private String studentId;
    
    private String subject;
    private String timeRange; // "week", "month", "semester", "all"
    
    public StudentAnalyticsRequest() {}
    
    public StudentAnalyticsRequest(String studentId, String subject, String timeRange) {
        this.studentId = studentId;
        this.subject = subject;
        this.timeRange = timeRange;
    }
    
    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getTimeRange() { return timeRange; }
    public void setTimeRange(String timeRange) { this.timeRange = timeRange; }
}
