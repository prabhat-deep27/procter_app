package com.procter.procter_app.controller;

import com.procter.procter_app.dto.StudentTestReviewResponse;
import com.procter.procter_app.model.TestAttempt;
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.TestAttemptRepository;
import com.procter.procter_app.repo.TestRepository;
import com.procter.procter_app.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final TestAttemptRepository testAttemptRepository;
    private final TestRepository testRepository;
    private final UserRepository userRepository;

    public StudentController(TestAttemptRepository testAttemptRepository,
                           TestRepository testRepository,
                           UserRepository userRepository) {
        this.testAttemptRepository = testAttemptRepository;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
    }

    // Debug endpoint to check if server is running
    @GetMapping("/debug")
    public ResponseEntity<String> debug() {
        return ResponseEntity.ok("Student controller is working!");
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/test/{testId}/review")
    public ResponseEntity<StudentTestReviewResponse> getStudentTestReview(
            @PathVariable("testId") String testId,
            @AuthenticationPrincipal User student) {
        
        System.out.println("=== DEBUG: Student Test Review Request ===");
        System.out.println("TestId: " + testId);
        System.out.println("Student: " + (student != null ? student.getEmail() + " (ID: " + student.getId() + ")" : "null"));
        System.out.println("Student Role: " + (student != null ? student.getRole() : "null"));

        // Find the student's attempt for this test
        List<TestAttempt> allAttempts = testAttemptRepository.findByTestIdAndStudentId(testId, student.getId());
        System.out.println("All attempts found: " + allAttempts.size());
        
        List<TestAttempt> attempts = allAttempts.stream()
                .filter(TestAttempt::isCompleted)
                .collect(Collectors.toList());
        
        System.out.println("Completed attempts: " + attempts.size());

        if (attempts.isEmpty()) {
            System.out.println("No completed attempts found for student " + student.getId() + " and test " + testId);
            return ResponseEntity.notFound().build();
        }

        TestAttempt attempt = attempts.get(0);
        Optional<com.procter.procter_app.model.Test> testOpt = testRepository.findById(testId);
        
        if (testOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        com.procter.procter_app.model.Test test = testOpt.get();

        // Build the response
        StudentTestReviewResponse response = new StudentTestReviewResponse();
        response.setTestId(testId);
        response.setTestTitle(test.getTitle());
        response.setSubject(test.getSubject());
        response.setScore(attempt.getScore());
        response.setCorrectAnswers(attempt.getCorrectAnswers());
        response.setTotalQuestions(attempt.getTotalQuestions());
        response.setCompletedAt(attempt.getCompletedAt());
        response.setDurationInMinutes(attempt.getDurationInMinutes());
        
        // Calculate grade
        String grade = calculateGrade(attempt.getScore());
        response.setGrade(grade);
        
        // Calculate performance level
        String performanceLevel = calculatePerformanceLevel(attempt.getScore());
        response.setPerformanceLevel(performanceLevel);

        // Build question results with correct answers
        List<StudentTestReviewResponse.QuestionResult> questionResults = buildQuestionResults(test, attempt);
        response.setQuestionResults(questionResults);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-attempts")
    public ResponseEntity<List<StudentTestReviewResponse>> getMyTestAttempts(
            @AuthenticationPrincipal User student) {

        List<TestAttempt> attempts = testAttemptRepository.findByStudentId(student.getId())
                .stream()
                .filter(TestAttempt::isCompleted)
                .collect(Collectors.toList());

        List<StudentTestReviewResponse> responses = attempts.stream()
                .map(attempt -> {
                    StudentTestReviewResponse response = new StudentTestReviewResponse();
                    response.setTestId(attempt.getTestId());
                    response.setTestTitle(attempt.getTestTitle());
                    response.setSubject(attempt.getSubject());
                    response.setScore(attempt.getScore());
                    response.setCorrectAnswers(attempt.getCorrectAnswers());
                    response.setTotalQuestions(attempt.getTotalQuestions());
                    response.setCompletedAt(attempt.getCompletedAt());
                    response.setDurationInMinutes(attempt.getDurationInMinutes());
                    response.setGrade(calculateGrade(attempt.getScore()));
                    response.setPerformanceLevel(calculatePerformanceLevel(attempt.getScore()));
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    private String calculateGrade(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    private String calculatePerformanceLevel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 70) return "Average";
        return "Needs Improvement";
    }

    private List<StudentTestReviewResponse.QuestionResult> buildQuestionResults(
            com.procter.procter_app.model.Test test, TestAttempt attempt) {
        
        List<StudentTestReviewResponse.QuestionResult> results = new java.util.ArrayList<>();
        
        if (test.getQuestions() != null && attempt.getAnswers() != null) {
            for (int i = 0; i < test.getQuestions().size(); i++) {
                com.procter.procter_app.model.Question question = test.getQuestions().get(i);
                
                // Find the student's answer for this question
                Object studentAnswer = null;
                boolean isCorrect = false;
                
                for (java.util.Map<String, Object> answerEntry : attempt.getAnswers()) {
                    if (answerEntry.get("questionIndex").equals(i)) {
                        studentAnswer = answerEntry.get("answer");
                        isCorrect = (Boolean) answerEntry.get("isCorrect");
                        break;
                    }
                }
                
                StudentTestReviewResponse.QuestionResult result = new StudentTestReviewResponse.QuestionResult();
                result.setQuestionIndex(i);
                result.setQuestionText(question.getQuestionText());
                result.setStudentAnswer(studentAnswer);
                result.setCorrectAnswer(question.getCorrectAnswer());
                result.setCorrect(isCorrect);
                result.setQuestion(question);
                
                results.add(result);
            }
        }
        
        return results;
    }
}
