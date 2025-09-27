package com.procter.procter_app.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class TestReviewResponse {
    private String testId;
    private String testTitle;
    private String subject;
    private TestStatistics statistics;
    private List<StudentResult> studentResults;
    private QuestionAnalysis questionAnalysis;
    private AIReport aiReport;
    
    public TestReviewResponse() {}
    
    // Getters and Setters
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    
    public String getTestTitle() { return testTitle; }
    public void setTestTitle(String testTitle) { this.testTitle = testTitle; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public TestStatistics getStatistics() { return statistics; }
    public void setStatistics(TestStatistics statistics) { this.statistics = statistics; }
    
    public List<StudentResult> getStudentResults() { return studentResults; }
    public void setStudentResults(List<StudentResult> studentResults) { this.studentResults = studentResults; }
    
    public QuestionAnalysis getQuestionAnalysis() { return questionAnalysis; }
    public void setQuestionAnalysis(QuestionAnalysis questionAnalysis) { this.questionAnalysis = questionAnalysis; }
    
    public AIReport getAiReport() { return aiReport; }
    public void setAiReport(AIReport aiReport) { this.aiReport = aiReport; }
    
    // Inner classes
    public static class TestStatistics {
        private int totalStudents;
        private double averageScore;
        private double medianScore;
        private double highestScore;
        private double lowestScore;
        private double standardDeviation;
        private Map<String, Integer> gradeDistribution;
        private double passRate;
        
        public TestStatistics() {}
        
        // Getters and Setters
        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
        
        public double getAverageScore() { return averageScore; }
        public void setAverageScore(double averageScore) { this.averageScore = averageScore; }
        
        public double getMedianScore() { return medianScore; }
        public void setMedianScore(double medianScore) { this.medianScore = medianScore; }
        
        public double getHighestScore() { return highestScore; }
        public void setHighestScore(double highestScore) { this.highestScore = highestScore; }
        
        public double getLowestScore() { return lowestScore; }
        public void setLowestScore(double lowestScore) { this.lowestScore = lowestScore; }
        
        public double getStandardDeviation() { return standardDeviation; }
        public void setStandardDeviation(double standardDeviation) { this.standardDeviation = standardDeviation; }
        
        public Map<String, Integer> getGradeDistribution() { return gradeDistribution; }
        public void setGradeDistribution(Map<String, Integer> gradeDistribution) { this.gradeDistribution = gradeDistribution; }
        
        public double getPassRate() { return passRate; }
        public void setPassRate(double passRate) { this.passRate = passRate; }
    }
    
    public static class StudentResult {
        private String studentId;
        private String studentName;
        private int score;
        private String grade;
        private Instant completedAt;
        private int correctAnswers;
        private int totalQuestions;
        private String performanceLevel;
        private List<QuestionResult> questionResults;
        
        public StudentResult() {}
        
        // Getters and Setters
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
        
        public Instant getCompletedAt() { return completedAt; }
        public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
        
        public int getCorrectAnswers() { return correctAnswers; }
        public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
        
        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
        
        public String getPerformanceLevel() { return performanceLevel; }
        public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }
        
        public List<QuestionResult> getQuestionResults() { return questionResults; }
        public void setQuestionResults(List<QuestionResult> questionResults) { this.questionResults = questionResults; }
    }
    
    public static class QuestionResult {
        private int questionIndex;
        private String questionText;
        private boolean isCorrect;
        private Object studentAnswer;
        private Object correctAnswer;
        private double difficultyLevel;
        
        public QuestionResult() {}
        
        // Getters and Setters
        public int getQuestionIndex() { return questionIndex; }
        public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }
        
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        
        public Object getStudentAnswer() { return studentAnswer; }
        public void setStudentAnswer(Object studentAnswer) { this.studentAnswer = studentAnswer; }
        
        public Object getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(Object correctAnswer) { this.correctAnswer = correctAnswer; }
        
        public double getDifficultyLevel() { return difficultyLevel; }
        public void setDifficultyLevel(double difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    }
    
    public static class QuestionAnalysis {
        private List<QuestionDifficulty> questionDifficulties;
        private List<String> mostMissedQuestions;
        private List<String> mostCorrectQuestions;
        private Map<String, Double> topicPerformance;
        
        public QuestionAnalysis() {}
        
        // Getters and Setters
        public List<QuestionDifficulty> getQuestionDifficulties() { return questionDifficulties; }
        public void setQuestionDifficulties(List<QuestionDifficulty> questionDifficulties) { this.questionDifficulties = questionDifficulties; }
        
        public List<String> getMostMissedQuestions() { return mostMissedQuestions; }
        public void setMostMissedQuestions(List<String> mostMissedQuestions) { this.mostMissedQuestions = mostMissedQuestions; }
        
        public List<String> getMostCorrectQuestions() { return mostCorrectQuestions; }
        public void setMostCorrectQuestions(List<String> mostCorrectQuestions) { this.mostCorrectQuestions = mostCorrectQuestions; }
        
        public Map<String, Double> getTopicPerformance() { return topicPerformance; }
        public void setTopicPerformance(Map<String, Double> topicPerformance) { this.topicPerformance = topicPerformance; }
    }
    
    public static class QuestionDifficulty {
        private int questionIndex;
        private double difficultyPercentage;
        private String difficultyLevel; // "Easy", "Medium", "Hard"
        
        public QuestionDifficulty() {}
        
        // Getters and Setters
        public int getQuestionIndex() { return questionIndex; }
        public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }
        
        public double getDifficultyPercentage() { return difficultyPercentage; }
        public void setDifficultyPercentage(double difficultyPercentage) { this.difficultyPercentage = difficultyPercentage; }
        
        public String getDifficultyLevel() { return difficultyLevel; }
        public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    }
    
    public static class AIReport {
        private String summary;
        private List<String> insights;
        private List<String> recommendations;
        private String classPerformance;
        private List<String> areasOfConcern;
        private String suggestedActions;
        
        public AIReport() {}
        
        // Getters and Setters
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        
        public List<String> getInsights() { return insights; }
        public void setInsights(List<String> insights) { this.insights = insights; }
        
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
        
        public String getClassPerformance() { return classPerformance; }
        public void setClassPerformance(String classPerformance) { this.classPerformance = classPerformance; }
        
        public List<String> getAreasOfConcern() { return areasOfConcern; }
        public void setAreasOfConcern(List<String> areasOfConcern) { this.areasOfConcern = areasOfConcern; }
        
        public String getSuggestedActions() { return suggestedActions; }
        public void setSuggestedActions(String suggestedActions) { this.suggestedActions = suggestedActions; }
    }
}
