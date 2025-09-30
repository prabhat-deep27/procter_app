package com.procter.procter_app.controller;

import com.procter.procter_app.dto.StudentAnalyticsRequest;
import com.procter.procter_app.dto.StudentAnalyticsResponse;
import com.procter.procter_app.dto.TestReviewRequest;
import com.procter.procter_app.dto.TestReviewResponse;
import com.procter.procter_app.service.AIAnalyticsService;
import com.procter.procter_app.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    public AnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/student")
    public ResponseEntity<StudentAnalyticsResponse> getStudentAnalytics(
            @RequestBody StudentAnalyticsRequest request,
            @AuthenticationPrincipal User teacher) {

        StudentAnalyticsResponse response = aiAnalyticsService.generateStudentAnalytics(
                request.getStudentId(),
                request.getSubject(),
                request.getTimeRange()
        );

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/test-review")
    public ResponseEntity<TestReviewResponse> getTestReview(
            @RequestBody TestReviewRequest request,
            @AuthenticationPrincipal User teacher) {

        TestReviewResponse response = aiAnalyticsService.generateTestReview(
                request.getTestId(),
                request.isIncludeAIReport()
        );

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/test/{testId}/review")
    public ResponseEntity<TestReviewResponse> getTestReviewById(
            @PathVariable("testId") String testId,
            @RequestParam(value = "includeAIReport", defaultValue = "true") boolean includeAIReport,
            @AuthenticationPrincipal User teacher) {

        TestReviewResponse response = aiAnalyticsService.generateTestReview(testId, includeAIReport);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-analytics")
    public ResponseEntity<StudentAnalyticsResponse> getMyAnalytics(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "timeRange", defaultValue = "all") String timeRange,
            @AuthenticationPrincipal User student) {

        StudentAnalyticsResponse response = aiAnalyticsService.generateStudentAnalytics(
                student.getId(),
                subject,
                timeRange
        );

        return ResponseEntity.ok(response);
    }
}