package com.procter.procter_app.service;

import com.procter.procter_app.dto.StudentAnalyticsResponse;
import com.procter.procter_app.dto.TestReviewResponse;
import com.procter.procter_app.model.TestAttempt;
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.TestAttemptRepository;
import com.procter.procter_app.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAnalyticsService {
    /* ================= AI INSIGHT HELPERS ================= */

    private String generateOverallSummary(
            double avg,
            String trend,
            int totalTests
    ) {
        return String.format(
                "You have completed %d tests with an average score of %.2f. " +
                        "Your overall performance trend is %s.",
                totalTests, avg, trend
        );
    }

    private List<String> generateRecommendations(
            Map<String, Double> subjectAverages,
            StudentAnalyticsResponse.PerformanceTrend trend,
            List<TestAttempt> attempts
    ) {
        List<String> recommendations = new ArrayList<>();

        if ("Declining".equals(trend.getTrend())) {
            recommendations.add(
                    "Your recent performance is declining. Revise weak topics and take mock tests."
            );
        }

        subjectAverages.forEach((subject, avg) -> {
            if (avg < 60) {
                recommendations.add(
                        "Focus more on " + subject + " to improve your score."
                );
            }
        });

        if (recommendations.isEmpty()) {
            recommendations.add("Keep up the good work and maintain consistency.");
        }

        return recommendations;
    }

    private List<String> generateConcerns(
            Map<String, Double> subjectAverages,
            double overallAverage,
            StudentAnalyticsResponse.PerformanceTrend trend
    ) {
        List<String> concerns = new ArrayList<>();

        if (overallAverage < 60) {
            concerns.add("Your overall average score is low.");
        }

        if ("Declining".equals(trend.getTrend())) {
            concerns.add("Your performance trend shows a decline.");
        }

        subjectAverages.forEach((subject, avg) -> {
            if (avg < 50) {
                concerns.add("Very low performance detected in " + subject);
            }
        });

        return concerns;
    }

    private String predictPerformance(
            StudentAnalyticsResponse.PerformanceTrend trend,
            double overallAverage
    ) {
        if ("Improving".equals(trend.getTrend())) {
            return "Your performance is likely to improve in upcoming tests.";
        }
        if ("Declining".equals(trend.getTrend())) {
            return "Performance may decline if corrective actions are not taken.";
        }
        return overallAverage >= 75
                ? "You are expected to maintain good performance."
                : "Consistent practice can improve your future results.";
    }

    private String determineLearningStyle(List<TestAttempt> attempts) {
        if (attempts.size() < 3) {
            return "Insufficient data to determine learning style.";
        }

        long highScoreCount =
                attempts.stream()
                        .filter(a -> a.getScore() >= 80)
                        .count();

        if (highScoreCount > attempts.size() / 2) {
            return "Concept-Oriented Learner";
        }

        return "Practice-Oriented Learner";
    }


    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;

    public AIAnalyticsService(TestAttemptRepository testAttemptRepository,
                              UserRepository userRepository) {
        this.testAttemptRepository = testAttemptRepository;
        this.userRepository = userRepository;
    }

    public StudentAnalyticsResponse generateStudentAnalytics(
            String studentId,
            String subject,
            String timeRange
    ) {
        StudentAnalyticsResponse response = new StudentAnalyticsResponse();
        response.setStudentId(studentId);

        userRepository.findById(studentId)
                .ifPresent(u -> response.setStudentName(u.getUsername()));

        List<TestAttempt> attempts = getFilteredAttempts(studentId, subject, timeRange);

        if (attempts.isEmpty()) {
            return response;
        }

        double overallAverage = attempts.stream()
                .mapToInt(TestAttempt::getScore)
                .average()
                .orElse(0.0);
        response.setOverallAverage(overallAverage);

        // ✅ NULL-SAFE SUBJECT AVERAGES (FIXED)
        Map<String, Double> subjectAverages =
                attempts.stream()
                        .filter(a -> a.getSubject() != null)
                        .collect(Collectors.groupingBy(
                                TestAttempt::getSubject,
                                Collectors.averagingInt(TestAttempt::getScore)
                        ));
        response.setSubjectAverages(subjectAverages);

        List<StudentAnalyticsResponse.TestPerformance> recentTests =
                attempts.stream()
                        .sorted(Comparator.comparing(TestAttempt::getCompletedAt).reversed())
                        .limit(10)
                        .map(this::convertToTestPerformance)
                        .collect(Collectors.toList());
        response.setRecentTests(recentTests);

        StudentAnalyticsResponse.PerformanceTrend trend =
                calculatePerformanceTrend(attempts);
        response.setPerformanceTrend(trend);

        response.setStrengthsWeaknesses(
                identifyStrengthsWeaknesses(subjectAverages)
        );

        response.setAiInsights(
                generateAIInsights(attempts, overallAverage, subjectAverages, trend)
        );

        return response;
    }

    private List<TestAttempt> getFilteredAttempts(
            String studentId,
            String subject,
            String timeRange
    ) {
        return testAttemptRepository
                .findByStudentIdAndIsCompletedTrueOrderByCompletedAtDesc(studentId)
                .stream()
                .filter(a -> subject == null ||
                        (a.getSubject() != null && a.getSubject().equals(subject)))
                .filter(a -> filterByTimeRange(a, timeRange))
                .collect(Collectors.toList());
    }

    private boolean filterByTimeRange(TestAttempt attempt, String timeRange) {
        if (timeRange == null || "all".equals(timeRange)) return true;
        if (attempt.getCompletedAt() == null) return false;

        Instant cutoff = switch (timeRange) {
            case "week" -> Instant.now().minus(7, ChronoUnit.DAYS);
            case "month" -> Instant.now().minus(30, ChronoUnit.DAYS);
            case "semester" -> Instant.now().minus(120, ChronoUnit.DAYS);
            default -> Instant.EPOCH;
        };

        return attempt.getCompletedAt().isAfter(cutoff);
    }

    private StudentAnalyticsResponse.TestPerformance convertToTestPerformance(
            TestAttempt attempt
    ) {
        StudentAnalyticsResponse.TestPerformance p =
                new StudentAnalyticsResponse.TestPerformance();
        p.setTestId(attempt.getTestId());
        p.setTestTitle(attempt.getTestTitle());
        p.setSubject(attempt.getSubject());
        p.setScore(attempt.getScore());
        p.setCompletedAt(attempt.getCompletedAt());
        p.setPerformanceLevel(getPerformanceLevel(attempt.getScore()));
        return p;
    }

    private StudentAnalyticsResponse.PerformanceTrend calculatePerformanceTrend(
            List<TestAttempt> attempts
    ) {
        StudentAnalyticsResponse.PerformanceTrend trend =
                new StudentAnalyticsResponse.PerformanceTrend();

        if (attempts.size() < 2) {
            trend.setTrend("Stable");
            trend.setTrendPercentage(0);
            return trend;
        }

        List<TestAttempt> sorted =
                attempts.stream()
                        .filter(a -> a.getCompletedAt() != null)
                        .sorted(Comparator.comparing(TestAttempt::getCompletedAt))
                        .collect(Collectors.toList());

        int mid = sorted.size() / 2;

        double first =
                sorted.subList(0, mid).stream()
                        .mapToInt(TestAttempt::getScore)
                        .average().orElse(0);

        double second =
                sorted.subList(mid, sorted.size()).stream()
                        .mapToInt(TestAttempt::getScore)
                        .average().orElse(0);

        double change = first > 0 ? ((second - first) / first) * 100 : 0;

        trend.setTrend(
                change > 5 ? "Improving" :
                        change < -5 ? "Declining" : "Stable"
        );
        trend.setTrendPercentage(Math.abs(change));

        trend.setScoresOverTime(
                sorted.stream()
                        .map(a -> (double) a.getScore())
                        .collect(Collectors.toList())
        );

        trend.setTimeLabels(
                sorted.stream()
                        .map(a -> a.getCompletedAt().toString().substring(0, 10))
                        .collect(Collectors.toList())
        );

        return trend;
    }

    private List<StudentAnalyticsResponse.StrengthWeakness>
    identifyStrengthsWeaknesses(Map<String, Double> subjectAverages) {

        double overall =
                subjectAverages.values().stream()
                        .mapToDouble(Double::doubleValue)
                        .average().orElse(0);

        List<StudentAnalyticsResponse.StrengthWeakness> list = new ArrayList<>();

        subjectAverages.forEach((subject, avg) -> {
            StudentAnalyticsResponse.StrengthWeakness sw =
                    new StudentAnalyticsResponse.StrengthWeakness();
            sw.setSubject(subject);
            sw.setScore(avg);

            if (avg >= overall + 10) {
                sw.setType("Strength");
                sw.setDescription("Strong performance in " + subject);
            } else if (avg <= overall - 10) {
                sw.setType("Weakness");
                sw.setDescription("Weak performance in " + subject);
            }

            if (sw.getType() != null) list.add(sw);
        });

        return list;
    }

    private StudentAnalyticsResponse.AIInsights generateAIInsights(
            List<TestAttempt> attempts,
            double overallAverage,
            Map<String, Double> subjectAverages,
            StudentAnalyticsResponse.PerformanceTrend trend
    ) {
        StudentAnalyticsResponse.AIInsights i =
                new StudentAnalyticsResponse.AIInsights();

        i.setOverallSummary(
                generateOverallSummary(overallAverage, trend.getTrend(), attempts.size())
        );
        i.setRecommendations(
                generateRecommendations(subjectAverages, trend, attempts)
        );
        i.setConcerns(
                generateConcerns(subjectAverages, overallAverage, trend)
        );
        i.setPredictedPerformance(
                predictPerformance(trend, overallAverage)
        );
        i.setLearningStyle(determineLearningStyle(attempts));

        return i;
    }

    private String getPerformanceLevel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 70) return "Average";
        return "Needs Improvement";
    }

    private String calculateGrade(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }
}
