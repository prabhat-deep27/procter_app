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
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.TestRepository;
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
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureRandom random = new SecureRandom();

    public TestController(TestRepository testRepository, SimpMessagingTemplate messagingTemplate) {
        this.testRepository = testRepository;
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
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Test>> getUserTestsBySubject(
            @PathVariable("subject") String subject,
            @AuthenticationPrincipal User user) {

        // Query for tests where subject matches and user is either creator or participant
        List<Test> tests = testRepository.findBySubjectAndUserInvolvement(subject, user.getId());
        return ResponseEntity.ok(tests);
    }


}
