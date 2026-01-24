package com.procter.procter_app.dto;

import jakarta.validation.constraints.NotBlank;

public class TestReviewRequest {
    @NotBlank
    private String testId;
    
    private String subject;
    private boolean includeAIReport;
    
    public TestReviewRequest() {}
    
    public TestReviewRequest(String testId, String subject, boolean includeAIReport) {
        this.testId = testId;
        this.subject = subject;
        this.includeAIReport = includeAIReport;
    }
    
    // Getters and Setters
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public boolean isIncludeAIReport() { return includeAIReport; }
    public void setIncludeAIReport(boolean includeAIReport) { this.includeAIReport = includeAIReport; }
}
