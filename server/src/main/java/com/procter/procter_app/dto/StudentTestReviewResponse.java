package com.procter.procter_app.dto;

import com.procter.procter_app.model.Question;
import java.time.Instant;
import java.util.List;

public class StudentTestReviewResponse {
    private String testId;
    private String testTitle;
    private String subject;
    private int score;
    private int correctAnswers;
    private int totalQuestions;
    private Instant completedAt;
    private int durationInMinutes;
    private String grade;
    private String performanceLevel;
    private List<QuestionResult> questionResults;
    private TeacherFeedback teacherFeedback;
    private int rank;
    private int totalStudents;
    private double percentile;
    
    public StudentTestReviewResponse() {}
    
    // Getters and Setters
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    
    public String getTestTitle() { return testTitle; }
    public void setTestTitle(String testTitle) { this.testTitle = testTitle; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    
    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
    
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    
    public int getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(int durationInMinutes) { this.durationInMinutes = durationInMinutes; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getPerformanceLevel() { return performanceLevel; }
    public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }
    
    public List<QuestionResult> getQuestionResults() { return questionResults; }
    public void setQuestionResults(List<QuestionResult> questionResults) { this.questionResults = questionResults; }
    
    public TeacherFeedback getTeacherFeedback() { return teacherFeedback; }
    public void setTeacherFeedback(TeacherFeedback teacherFeedback) { this.teacherFeedback = teacherFeedback; }
    
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    
    public double getPercentile() { return percentile; }
    public void setPercentile(double percentile) { this.percentile = percentile; }
    
    // Inner classes
    public static class QuestionResult {
        private int questionIndex;
        private String questionText;
        private Object studentAnswer;
        private Object correctAnswer;
        private boolean isCorrect;
        private Question question;
        private String explanation;
        
        public QuestionResult() {}
        
        // Getters and Setters
        public int getQuestionIndex() { return questionIndex; }
        public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }
        
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        
        public Object getStudentAnswer() { return studentAnswer; }
        public void setStudentAnswer(Object studentAnswer) { this.studentAnswer = studentAnswer; }
        
        public Object getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(Object correctAnswer) { this.correctAnswer = correctAnswer; }
        
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        
        public Question getQuestion() { return question; }
        public void setQuestion(Question question) { this.question = question; }
        
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
    
    public static class TeacherFeedback {
        private String general;
        private List<String> suggestions;
        private String strengths;
        private String areasForImprovement;
        
        public TeacherFeedback() {}
        
        // Getters and Setters
        public String getGeneral() { return general; }
        public void setGeneral(String general) { this.general = general; }
        
        public List<String> getSuggestions() { return suggestions; }
        public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
        
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        
        public String getAreasForImprovement() { return areasForImprovement; }
        public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }
    }
}
