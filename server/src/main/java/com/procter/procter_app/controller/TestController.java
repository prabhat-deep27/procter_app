package com.procter.procter_app.controller;

// --- Add all necessary imports for Spring Web and Security ---
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

// Your existing project-specific imports
import com.procter.procter_app.dto.CreateTestRequest;
import com.procter.procter_app.model.Test;
import com.procter.procter_app.model.TestAttempt;
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.TestRepository;
import com.procter.procter_app.repo.TestAttemptRepository;
import jakarta.validation.constraints.NotBlank;

// Other standard Java imports
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureRandom random = new SecureRandom();

    public TestController(TestRepository testRepository, TestAttemptRepository testAttemptRepository, SimpMessagingTemplate messagingTemplate) {
        this.testRepository = testRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping
    public ResponseEntity<List<Test>> getAllTestsForTeacher(@AuthenticationPrincipal User teacher) {
        List<Test> tests = testRepository.findAllByCreatedByTeacherId(teacher.getId());
        return ResponseEntity.ok(tests);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<?> createTestWithQuestions(@AuthenticationPrincipal User teacher,
                                                     @RequestBody CreateTestRequest request) {

        Test newTest = new Test();
        newTest.setTitle(request.getTitle());
        newTest.setSubject(request.getSubject());
        newTest.setScheduledAt(request.getScheduledAt());
        newTest.setDurationInMinutes(request.getDurationInMinutes());
        newTest.setQuestions(request.getQuestions());
        newTest.setCreatedByTeacherId(teacher.getId());
        newTest.setJoinCode(generateJoinCode());

        Test savedTest = testRepository.save(newTest);

        String joinLink = "/api/tests/join/" + savedTest.getJoinCode();

        return ResponseEntity.ok(Map.of(
                "id", savedTest.getId(),
                "title", savedTest.getTitle(),
                "joinCode", savedTest.getJoinCode(),
                "joinLink", joinLink
        ));
    }

    @GetMapping("/{id}")
    // --- FIX APPLIED HERE ---
    public ResponseEntity<?> getTestById(@PathVariable("id") String id, @AuthenticationPrincipal User user) {
        Optional<Test> testOptional = testRepository.findById(id);

        if (testOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found with id: " + id));
        }

        Test test = testOptional.get();

        boolean isCreator = test.getCreatedByTeacherId().equals(user.getId());
        boolean isParticipant = test.getParticipantIds().contains(user.getId());

        if (isCreator || isParticipant) {
            return ResponseEntity.ok(test);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to view this test."));
        }
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/join/{joinCode}")
    // --- FIX APPLIED HERE ---
    public ResponseEntity<?> join(@PathVariable("joinCode") @NotBlank String joinCode,
                                  @AuthenticationPrincipal User student) {

        Optional<Test> testOptional = testRepository.findByJoinCode(joinCode);

        if (testOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Invalid join code."));
        }

        Test test = testOptional.get();

        if (test.getParticipantIds().contains(student.getId())) {
            return ResponseEntity.ok(Map.of("status", "already_joined", "testId", test.getId()));
        }

        test.getParticipantIds().add(student.getId());
        testRepository.save(test);

        messagingTemplate.convertAndSend("/topic/test/" + test.getId() + "/events",
                Map.of("type", "JOINED", "studentId", student.getId(), "timestamp", Instant.now().toString()));

        return ResponseEntity.ok(Map.of("status", "joined", "testId", test.getId()));
    }

    private String generateJoinCode() {
        byte[] buf = new byte[6];
        random.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitAttempt(@PathVariable("id") String id,
                                           @AuthenticationPrincipal User student,
                                           @RequestBody com.procter.procter_app.dto.SubmitAttemptRequest request) {
        
        // Debug logging
        System.out.println("Submit attempt called for test ID: " + id);
        System.out.println("Student: " + (student != null ? student.getEmail() + " (Role: " + student.getRole() + ")" : "null"));
        System.out.println("Request answers: " + request.getAnswers());
        
        Optional<Test> testOptional = testRepository.findById(id);
        if (testOptional.isEmpty()) {
            System.out.println("Test not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }
        Test test = testOptional.get();
        System.out.println("Test found: " + test.getTitle());
        
        // Check if user is a participant in the test
        boolean isCreator = test.getCreatedByTeacherId().equals(student.getId());
        boolean isParticipant = test.getParticipantIds().contains(student.getId());
        
        if (!isCreator && !isParticipant) {
            System.out.println("User is not a participant in the test, auto-adding them...");
            // Auto-add the user as a participant
            test.getParticipantIds().add(student.getId());
            testRepository.save(test);
            System.out.println("User added as participant");
        }
        
        System.out.println("User is authorized to submit the test");

        // Build attempt and compute simple score
        TestAttempt attempt = new TestAttempt();
        attempt.setTestId(test.getId());
        attempt.setStudentId(student.getId());
        attempt.setTestTitle(test.getTitle());
        attempt.setSubject(test.getSubject());
        attempt.setJoinCode(test.getJoinCode());
        attempt.setDurationInMinutes(request.getDurationInMinutes() != null ? request.getDurationInMinutes() : test.getDurationInMinutes());

        int total = test.getQuestions() != null ? test.getQuestions().size() : 0;
        int correct = 0;

        // Normalize answers into list indexed by question
        java.util.List<?> answers = request.getAnswers();
        java.util.List<java.util.Map<String, Object>> storedAnswers = new java.util.ArrayList<>();

        for (int i = 0; i < total; i++) {
            com.procter.procter_app.model.Question q = test.getQuestions().get(i);
            Object ans = (answers != null && i < answers.size()) ? answers.get(i) : null;
            boolean isCorrect = false;

            if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                // choice based
                java.util.List<Integer> correctIdx = q.getCorrectAnswer();
                if (ans instanceof Number) {
                    isCorrect = correctIdx != null && correctIdx.size() == 1 && correctIdx.get(0).equals(((Number) ans).intValue());
                } else if (ans instanceof java.util.List<?>) {
                    try {
                        java.util.List<Integer> selected = new java.util.ArrayList<>();
                        for (Object o : (java.util.List<?>) ans) selected.add(((Number) o).intValue());
                        java.util.List<Integer> aSorted = new java.util.ArrayList<>(selected);
                        java.util.Collections.sort(aSorted);
                        java.util.List<Integer> cSorted = new java.util.ArrayList<>(correctIdx != null ? correctIdx : java.util.List.of());
                        java.util.Collections.sort(cSorted);
                        isCorrect = aSorted.equals(cSorted);
                    } catch (Exception ignore) { isCorrect = false; }
                }
            } else {
                // text based; not auto-graded
                isCorrect = false;
            }

            if (isCorrect) correct++;

            java.util.Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("questionIndex", i);
            entry.put("answer", ans);
            entry.put("isCorrect", isCorrect);
            storedAnswers.add(entry);
        }

        attempt.setTotalQuestions(total);
        attempt.setCorrectAnswers(correct);
        attempt.setScore(total > 0 ? Math.round((correct * 100.0f) / total) : 0);
        attempt.setAnswers(storedAnswers);
        attempt.setCompleted(true);
        attempt.setCompletedAt(java.time.Instant.now());

        TestAttempt saved = testAttemptRepository.save(attempt);
        messagingTemplate.convertAndSend("/topic/test/" + test.getId() + "/events",
                Map.of("type", "SUBMITTED", "studentId", student.getId(), "attemptId", saved.getId(), "timestamp", java.time.Instant.now().toString()));

        return ResponseEntity.ok(Map.of(
                "attemptId", saved.getId(),
                "score", saved.getScore(),
                "correct", saved.getCorrectAnswers(),
                "total", saved.getTotalQuestions()
        ));
    }
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Test>> getUserTestsBySubject(
            @PathVariable("subject") String subject,
            @AuthenticationPrincipal User user) {

        // Query for tests where subject matches and user is either creator or participant
        List<Test> tests = testRepository.findBySubjectAndUserInvolvement(subject, user.getId());
        return ResponseEntity.ok(tests);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/completed")
    public ResponseEntity<List<TestAttempt>> getStudentCompletedTests(@AuthenticationPrincipal User student) {
        List<TestAttempt> completedTests = testAttemptRepository.findByStudentIdAndIsCompletedTrueOrderByCompletedAtDesc(student.getId());
        return ResponseEntity.ok(completedTests);
    }

}
