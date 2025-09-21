package com.procter.procter_app.model;

import java.util.List;

// This is NOT a @Document. It's a plain object that gets embedded.
public class Question {
    private String type;
    private String questionText;
    private int points;
    private List<String> options;
    private List<Integer> correctAnswer;
    private Integer wordLimit;
    private String sampleAnswer;

    // --- Getters and Setters for all fields ---
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public List<Integer> getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(List<Integer> correctAnswer) { this.correctAnswer = correctAnswer; }
    public Integer getWordLimit() { return wordLimit; }
    public void setWordLimit(Integer wordLimit) { this.wordLimit = wordLimit; }
    public String getSampleAnswer() { return sampleAnswer; }
    public void setSampleAnswer(String sampleAnswer) { this.sampleAnswer = sampleAnswer; }
}
