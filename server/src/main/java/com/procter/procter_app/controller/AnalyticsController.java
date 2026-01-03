package com.procter.procter_app.controller;

import com.procter.procter_app.dto.StudentAnalyticsResponse;
import com.procter.procter_app.model.User;
import com.procter.procter_app.service.AIAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    public AnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    /* ===================== STUDENT ENDPOINT ===================== */

    @GetMapping("/my-analytics")
    public ResponseEntity<StudentAnalyticsResponse> getMyAnalytics(
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "all") String timeRange,
            @AuthenticationPrincipal User student) {

        // Authentication is handled by SecurityFilterChain
        if (student == null) {
            return ResponseEntity.status(401).body(null);
        }

        // Debug logs for verification
        System.out.println("=== STUDENT ANALYTICS REQUEST ===");
        System.out.println("Student ID: " + student.getId());
        System.out.println("Student Email: " + student.getEmail());
        System.out.println("Student Role: " + student.getRole());
        System.out.println("Subject filter: " + subject);
        System.out.println("Time range: " + timeRange);

        StudentAnalyticsResponse response = aiAnalyticsService.generateStudentAnalytics(
                student.getId(),
                subject,
                timeRange
        );

        return ResponseEntity.ok(response);
    }

    /* ===================== AUTH TEST ===================== */

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        // Return current user info + authorities attached by JwtAuthFilter
        return ResponseEntity.ok(
                java.util.Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "authorities", auth != null ? auth.getAuthorities().toString() : "none"
                )
        );
    }
}
