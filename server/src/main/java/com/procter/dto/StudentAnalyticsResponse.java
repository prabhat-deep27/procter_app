package com.procter.procter_app.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class StudentAnalyticsResponse {
    private String studentId;
    private String studentName;
    private double overallAverage;
    private Map<String, Double> subjectAverages;
    private List<TestPerformance> recentTests;
    private PerformanceTrend performanceTrend;
    private List<StrengthWeakness> strengthsWeaknesses;
    private AIInsights aiInsights;
    
    public StudentAnalyticsResponse() {}
    
    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public double getOverallAverage() { return overallAverage; }
    public void setOverallAverage(double overallAverage) { this.overallAverage = overallAverage; }
    
    public Map<String, Double> getSubjectAverages() { return subjectAverages; }
    public void setSubjectAverages(Map<String, Double> subjectAverages) { this.subjectAverages = subjectAverages; }
    
    public List<TestPerformance> getRecentTests() { return recentTests; }
    public void setRecentTests(List<TestPerformance> recentTests) { this.recentTests = recentTests; }
    
    public PerformanceTrend getPerformanceTrend() { return performanceTrend; }
    public void setPerformanceTrend(PerformanceTrend performanceTrend) { this.performanceTrend = performanceTrend; }
    
    public List<StrengthWeakness> getStrengthsWeaknesses() { return strengthsWeaknesses; }
    public void setStrengthsWeaknesses(List<StrengthWeakness> strengthsWeaknesses) { this.strengthsWeaknesses = strengthsWeaknesses; }
    
    public AIInsights getAiInsights() { return aiInsights; }
    public void setAiInsights(AIInsights aiInsights) { this.aiInsights = aiInsights; }
    
    // Inner classes for structured data
    public static class TestPerformance {
        private String testId;
        private String testTitle;
        private String subject;
        private int score;
        private Instant completedAt;
        private String performanceLevel; // "Excellent", "Good", "Average", "Needs Improvement"
        
        public TestPerformance() {}
        
        // Getters and Setters
        public String getTestId() { return testId; }
        public void setTestId(String testId) { this.testId = testId; }
        
        public String getTestTitle() { return testTitle; }
        public void setTestTitle(String testTitle) { this.testTitle = testTitle; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        
        public Instant getCompletedAt() { return completedAt; }
        public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
        
        public String getPerformanceLevel() { return performanceLevel; }
        public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }
    }
    
    public static class PerformanceTrend {
        private String trend; // "Improving", "Declining", "Stable"
        private double trendPercentage;
        private List<Double> scoresOverTime;
        private List<String> timeLabels;
        
        public PerformanceTrend() {}
        
        // Getters and Setters
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        
        public double getTrendPercentage() { return trendPercentage; }
        public void setTrendPercentage(double trendPercentage) { this.trendPercentage = trendPercentage; }
        
        public List<Double> getScoresOverTime() { return scoresOverTime; }
        public void setScoresOverTime(List<Double> scoresOverTime) { this.scoresOverTime = scoresOverTime; }
        
        public List<String> getTimeLabels() { return timeLabels; }
        public void setTimeLabels(List<String> timeLabels) { this.timeLabels = timeLabels; }
    }
    
    public static class StrengthWeakness {
        private String subject;
        private String type; // "Strength" or "Weakness"
        private String description;
        private double score;
        
        public StrengthWeakness() {}
        
        // Getters and Setters
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
    }
    
    public static class AIInsights {
        private String overallSummary;
        private List<String> recommendations;
        private List<String> concerns;
        private String predictedPerformance;
        private String learningStyle;
        
        public AIInsights() {}
        
        // Getters and Setters
        public String getOverallSummary() { return overallSummary; }
        public void setOverallSummary(String overallSummary) { this.overallSummary = overallSummary; }
        
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
        
        public List<String> getConcerns() { return concerns; }
        public void setConcerns(List<String> concerns) { this.concerns = concerns; }
        
        public String getPredictedPerformance() { return predictedPerformance; }
        public void setPredictedPerformance(String predictedPerformance) { this.predictedPerformance = predictedPerformance; }
        
        public String getLearningStyle() { return learningStyle; }
        public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }
    }
}
