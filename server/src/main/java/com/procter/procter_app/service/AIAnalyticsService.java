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
    
    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;
    
    public AIAnalyticsService(TestAttemptRepository testAttemptRepository, UserRepository userRepository) {
        this.testAttemptRepository = testAttemptRepository;
        this.userRepository = userRepository;
    }
    
    public StudentAnalyticsResponse generateStudentAnalytics(String studentId, String subject, String timeRange) {
        StudentAnalyticsResponse response = new StudentAnalyticsResponse();
        response.setStudentId(studentId);
        
        // Get user information
        Optional<User> userOptional = userRepository.findById(studentId);
        if (userOptional.isPresent()) {
            response.setStudentName(userOptional.get().getUsername());
        }
        
        // Get test attempts based on filters
        List<TestAttempt> attempts = getFilteredAttempts(studentId, subject, timeRange);
        
        if (attempts.isEmpty()) {
            return response; // Return empty response if no attempts found
        }
        
        // Calculate overall average
        double overallAverage = attempts.stream()
                .mapToInt(TestAttempt::getScore)
                .average()
                .orElse(0.0);
        response.setOverallAverage(overallAverage);
        
        // Calculate subject averages
        Map<String, Double> subjectAverages = attempts.stream()
                .collect(Collectors.groupingBy(
                        TestAttempt::getSubject,
                        Collectors.averagingInt(TestAttempt::getScore)
                ));
        response.setSubjectAverages(subjectAverages);
        
        // Get recent test performances
        List<StudentAnalyticsResponse.TestPerformance> recentTests = attempts.stream()
                .sorted(Comparator.comparing(TestAttempt::getCompletedAt).reversed())
                .limit(10)
                .map(this::convertToTestPerformance)
                .collect(Collectors.toList());
        response.setRecentTests(recentTests);
        
        // Calculate performance trend
        StudentAnalyticsResponse.PerformanceTrend trend = calculatePerformanceTrend(attempts);
        response.setPerformanceTrend(trend);
        
        // Identify strengths and weaknesses
        List<StudentAnalyticsResponse.StrengthWeakness> strengthsWeaknesses = identifyStrengthsWeaknesses(subjectAverages);
        response.setStrengthsWeaknesses(strengthsWeaknesses);
        
        // Generate AI insights
        StudentAnalyticsResponse.AIInsights aiInsights = generateAIInsights(attempts, overallAverage, subjectAverages, trend);
        response.setAiInsights(aiInsights);
        
        return response;
    }
    
    public TestReviewResponse generateTestReview(String testId, boolean includeAIReport) {
        TestReviewResponse response = new TestReviewResponse();
        response.setTestId(testId);
        
        // Get all attempts for this test
        List<TestAttempt> attempts = testAttemptRepository.findByTestIdAndStudentId(testId, null)
                .stream()
                .filter(TestAttempt::isCompleted)
                .collect(Collectors.toList());
        
        if (attempts.isEmpty()) {
            return response;
        }
        
        // Set basic test info from first attempt
        TestAttempt firstAttempt = attempts.get(0);
        response.setTestTitle(firstAttempt.getTestTitle());
        response.setSubject(firstAttempt.getSubject());
        
        // Calculate statistics
        TestReviewResponse.TestStatistics statistics = calculateTestStatistics(attempts);
        response.setStatistics(statistics);
        
        // Get student results
        List<TestReviewResponse.StudentResult> studentResults = getStudentResults(attempts);
        response.setStudentResults(studentResults);
        
        // Analyze questions
        TestReviewResponse.QuestionAnalysis questionAnalysis = analyzeQuestions(attempts);
        response.setQuestionAnalysis(questionAnalysis);
        
        // Generate AI report if requested
        if (includeAIReport) {
            TestReviewResponse.AIReport aiReport = generateTestAIReport(attempts, statistics, questionAnalysis);
            response.setAiReport(aiReport);
        }
        
        return response;
    }
    
    private List<TestAttempt> getFilteredAttempts(String studentId, String subject, String timeRange) {
        List<TestAttempt> allAttempts = testAttemptRepository.findByStudentIdAndIsCompletedTrueOrderByCompletedAtDesc(studentId);
        
        List<TestAttempt> filtered = allAttempts.stream()
                .filter(attempt -> subject == null || attempt.getSubject().equals(subject))
                .filter(attempt -> filterByTimeRange(attempt, timeRange))
                .collect(Collectors.toList());
        
        return filtered;
    }
    
    private boolean filterByTimeRange(TestAttempt attempt, String timeRange) {
        if (timeRange == null || timeRange.equals("all")) {
            return true;
        }
        
        Instant cutoff = switch (timeRange) {
            case "week" -> Instant.now().minus(7, ChronoUnit.DAYS);
            case "month" -> Instant.now().minus(30, ChronoUnit.DAYS);
            case "semester" -> Instant.now().minus(120, ChronoUnit.DAYS);
            default -> Instant.now();
        };
        
        return attempt.getCompletedAt() != null && attempt.getCompletedAt().isAfter(cutoff);
    }
    
    private StudentAnalyticsResponse.TestPerformance convertToTestPerformance(TestAttempt attempt) {
        StudentAnalyticsResponse.TestPerformance performance = new StudentAnalyticsResponse.TestPerformance();
        performance.setTestId(attempt.getTestId());
        performance.setTestTitle(attempt.getTestTitle());
        performance.setSubject(attempt.getSubject());
        performance.setScore(attempt.getScore());
        performance.setCompletedAt(attempt.getCompletedAt());
        performance.setPerformanceLevel(getPerformanceLevel(attempt.getScore()));
        return performance;
    }
    
    private StudentAnalyticsResponse.PerformanceTrend calculatePerformanceTrend(List<TestAttempt> attempts) {
        StudentAnalyticsResponse.PerformanceTrend trend = new StudentAnalyticsResponse.PerformanceTrend();
        
        if (attempts.size() < 2) {
            trend.setTrend("Stable");
            trend.setTrendPercentage(0.0);
            return trend;
        }
        
        // Sort by completion date
        List<TestAttempt> sortedAttempts = attempts.stream()
                .sorted(Comparator.comparing(TestAttempt::getCompletedAt))
                .collect(Collectors.toList());
        
        // Calculate trend
        double firstHalf = sortedAttempts.subList(0, sortedAttempts.size() / 2).stream()
                .mapToInt(TestAttempt::getScore)
                .average()
                .orElse(0.0);
        
        double secondHalf = sortedAttempts.subList(sortedAttempts.size() / 2, sortedAttempts.size()).stream()
                .mapToInt(TestAttempt::getScore)
                .average()
                .orElse(0.0);
        
        double changePercentage = ((secondHalf - firstHalf) / firstHalf) * 100;
        
        if (changePercentage > 5) {
            trend.setTrend("Improving");
        } else if (changePercentage < -5) {
            trend.setTrend("Declining");
        } else {
            trend.setTrend("Stable");
        }
        
        trend.setTrendPercentage(Math.abs(changePercentage));
        
        // Prepare data for charts
        List<Double> scores = sortedAttempts.stream()
                .mapToDouble(TestAttempt::getScore)
                .boxed()
                .collect(Collectors.toList());
        trend.setScoresOverTime(scores);
        
        List<String> timeLabels = sortedAttempts.stream()
                .map(attempt -> attempt.getCompletedAt().toString().substring(0, 10))
                .collect(Collectors.toList());
        trend.setTimeLabels(timeLabels);
        
        return trend;
    }
    
    private List<StudentAnalyticsResponse.StrengthWeakness> identifyStrengthsWeaknesses(Map<String, Double> subjectAverages) {
        List<StudentAnalyticsResponse.StrengthWeakness> result = new ArrayList<>();
        
        double overallAverage = subjectAverages.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        for (Map.Entry<String, Double> entry : subjectAverages.entrySet()) {
            StudentAnalyticsResponse.StrengthWeakness item = new StudentAnalyticsResponse.StrengthWeakness();
            item.setSubject(entry.getKey());
            item.setScore(entry.getValue());
            
            if (entry.getValue() >= overallAverage + 10) {
                item.setType("Strength");
                item.setDescription("Above average performance in " + entry.getKey());
            } else if (entry.getValue() <= overallAverage - 10) {
                item.setType("Weakness");
                item.setDescription("Below average performance in " + entry.getKey());
            }
            
            if (item.getType() != null) {
                result.add(item);
            }
        }
        
        return result;
    }
    
    private StudentAnalyticsResponse.AIInsights generateAIInsights(List<TestAttempt> attempts, 
                                                                  double overallAverage, 
                                                                  Map<String, Double> subjectAverages,
                                                                  StudentAnalyticsResponse.PerformanceTrend trend) {
        StudentAnalyticsResponse.AIInsights insights = new StudentAnalyticsResponse.AIInsights();
        
        // Generate overall summary
        String summary = generateOverallSummary(overallAverage, trend.getTrend(), attempts.size());
        insights.setOverallSummary(summary);
        
        // Generate recommendations
        List<String> recommendations = generateRecommendations(subjectAverages, trend, attempts);
        insights.setRecommendations(recommendations);
        
        // Generate concerns
        List<String> concerns = generateConcerns(subjectAverages, overallAverage, trend);
        insights.setConcerns(concerns);
        
        // Predict performance
        String predictedPerformance = predictPerformance(trend, overallAverage);
        insights.setPredictedPerformance(predictedPerformance);
        
        // Determine learning style
        String learningStyle = determineLearningStyle(attempts);
        insights.setLearningStyle(learningStyle);
        
        return insights;
    }
    
    private String generateOverallSummary(double overallAverage, String trend, int totalTests) {
        StringBuilder summary = new StringBuilder();
        
        if (overallAverage >= 85) {
            summary.append("Excellent academic performance with an average of ").append(String.format("%.1f", overallAverage)).append("%. ");
        } else if (overallAverage >= 70) {
            summary.append("Good academic performance with an average of ").append(String.format("%.1f", overallAverage)).append("%. ");
        } else if (overallAverage >= 60) {
            summary.append("Average academic performance with an average of ").append(String.format("%.1f", overallAverage)).append("%. ");
        } else {
            summary.append("Academic performance needs improvement with an average of ").append(String.format("%.1f", overallAverage)).append("%. ");
        }
        
        if ("Improving".equals(trend)) {
            summary.append("Performance shows positive trend over time.");
        } else if ("Declining".equals(trend)) {
            summary.append("Performance shows declining trend that needs attention.");
        } else {
            summary.append("Performance remains stable across tests.");
        }
        
        summary.append(" Based on ").append(totalTests).append(" completed tests.");
        
        return summary.toString();
    }
    
    private List<String> generateRecommendations(Map<String, Double> subjectAverages, 
                                                StudentAnalyticsResponse.PerformanceTrend trend,
                                                List<TestAttempt> attempts) {
        List<String> recommendations = new ArrayList<>();
        
        // Subject-specific recommendations
        for (Map.Entry<String, Double> entry : subjectAverages.entrySet()) {
            if (entry.getValue() < 70) {
                recommendations.add("Focus on improving " + entry.getKey() + " - consider additional practice or tutoring");
            }
        }
        
        // Trend-based recommendations
        if ("Declining".equals(trend.getTrend())) {
            recommendations.add("Schedule regular review sessions to address declining performance");
            recommendations.add("Consider reducing workload or seeking academic support");
        } else if ("Improving".equals(trend.getTrend())) {
            recommendations.add("Continue current study strategies as they are showing positive results");
        }
        
        // Time-based recommendations
        if (attempts.size() < 5) {
            recommendations.add("Complete more tests to get a better understanding of performance patterns");
        }
        
        return recommendations;
    }
    
    private List<String> generateConcerns(Map<String, Double> subjectAverages, double overallAverage, StudentAnalyticsResponse.PerformanceTrend trend) {
        List<String> concerns = new ArrayList<>();
        
        if (overallAverage < 60) {
            concerns.add("Overall academic performance is below passing threshold");
        }
        
        for (Map.Entry<String, Double> entry : subjectAverages.entrySet()) {
            if (entry.getValue() < 50) {
                concerns.add("Critical performance issue in " + entry.getKey() + " - immediate intervention needed");
            }
        }
        
        if ("Declining".equals(trend.getTrend()) && trend.getTrendPercentage() > 15) {
            concerns.add("Significant decline in performance over time - requires immediate attention");
        }
        
        return concerns;
    }
    
    private String predictPerformance(StudentAnalyticsResponse.PerformanceTrend trend, double currentAverage) {
        if ("Improving".equals(trend.getTrend())) {
            return "Based on current trends, performance is expected to continue improving";
        } else if ("Declining".equals(trend.getTrend())) {
            return "Performance may continue to decline without intervention - immediate action recommended";
        } else {
            return "Performance is expected to remain stable at current levels";
        }
    }
    
    private String determineLearningStyle(List<TestAttempt> attempts) {
        // Simple heuristic based on performance patterns
        if (attempts.size() < 3) {
            return "Insufficient data to determine learning style";
        }
        
        // Check for consistent performance vs. variable performance
        double standardDeviation = calculateStandardDeviation(attempts.stream()
                .mapToInt(TestAttempt::getScore)
                .toArray());
        
        if (standardDeviation < 10) {
            return "Consistent learner - performs steadily across different topics";
        } else if (standardDeviation > 20) {
            return "Variable learner - performance varies significantly between topics";
        } else {
            return "Balanced learner - shows moderate variation in performance";
        }
    }
    
    private double calculateStandardDeviation(int[] scores) {
        double mean = Arrays.stream(scores).average().orElse(0.0);
        double variance = Arrays.stream(scores)
                .mapToDouble(score -> Math.pow(score - mean, 2))
                .average()
                .orElse(0.0);
        return Math.sqrt(variance);
    }
    
    private TestReviewResponse.TestStatistics calculateTestStatistics(List<TestAttempt> attempts) {
        TestReviewResponse.TestStatistics stats = new TestReviewResponse.TestStatistics();
        
        List<Integer> scores = attempts.stream().mapToInt(TestAttempt::getScore).boxed().collect(Collectors.toList());
        
        stats.setTotalStudents(attempts.size());
        stats.setAverageScore(scores.stream().mapToInt(Integer::intValue).average().orElse(0.0));
        stats.setHighestScore(scores.stream().mapToInt(Integer::intValue).max().orElse(0));
        stats.setLowestScore(scores.stream().mapToInt(Integer::intValue).min().orElse(0));
        
        // Calculate median
        scores.sort(Integer::compareTo);
        int middle = scores.size() / 2;
        if (scores.size() % 2 == 0) {
            stats.setMedianScore((scores.get(middle - 1) + scores.get(middle)) / 2.0);
        } else {
            stats.setMedianScore(scores.get(middle));
        }
        
        // Calculate standard deviation
        double mean = stats.getAverageScore();
        double variance = scores.stream()
                .mapToDouble(score -> Math.pow(score - mean, 2))
                .average()
                .orElse(0.0);
        stats.setStandardDeviation(Math.sqrt(variance));
        
        // Grade distribution
        Map<String, Integer> gradeDistribution = new HashMap<>();
        gradeDistribution.put("A (90-100)", (int) scores.stream().filter(s -> s >= 90).count());
        gradeDistribution.put("B (80-89)", (int) scores.stream().filter(s -> s >= 80 && s < 90).count());
        gradeDistribution.put("C (70-79)", (int) scores.stream().filter(s -> s >= 70 && s < 80).count());
        gradeDistribution.put("D (60-69)", (int) scores.stream().filter(s -> s >= 60 && s < 70).count());
        gradeDistribution.put("F (0-59)", (int) scores.stream().filter(s -> s < 60).count());
        stats.setGradeDistribution(gradeDistribution);
        
        // Pass rate (assuming 60% is passing)
        stats.setPassRate((double) scores.stream().filter(s -> s >= 60).count() / scores.size() * 100);
        
        return stats;
    }
    
    private List<TestReviewResponse.StudentResult> getStudentResults(List<TestAttempt> attempts) {
        return attempts.stream().map(attempt -> {
            TestReviewResponse.StudentResult result = new TestReviewResponse.StudentResult();
            result.setStudentId(attempt.getStudentId());
            
            // Get student name
            Optional<User> user = userRepository.findById(attempt.getStudentId());
            result.setStudentName(user.map(User::getUsername).orElse("Unknown"));
            
            result.setScore(attempt.getScore());
            result.setGrade(calculateGrade(attempt.getScore()));
            result.setCompletedAt(attempt.getCompletedAt());
            result.setCorrectAnswers(attempt.getCorrectAnswers());
            result.setTotalQuestions(attempt.getTotalQuestions());
            result.setPerformanceLevel(getPerformanceLevel(attempt.getScore()));
            
            return result;
        }).collect(Collectors.toList());
    }
    
    private TestReviewResponse.QuestionAnalysis analyzeQuestions(List<TestAttempt> attempts) {
        TestReviewResponse.QuestionAnalysis analysis = new TestReviewResponse.QuestionAnalysis();
        
        // This is a simplified analysis - in a real implementation, you'd analyze the actual question data
        List<TestReviewResponse.QuestionDifficulty> difficulties = new ArrayList<>();
        List<String> mostMissed = new ArrayList<>();
        List<String> mostCorrect = new ArrayList<>();
        
        // Mock data for demonstration
        for (int i = 1; i <= 5; i++) {
            TestReviewResponse.QuestionDifficulty difficulty = new TestReviewResponse.QuestionDifficulty();
            difficulty.setQuestionIndex(i);
            difficulty.setDifficultyPercentage(Math.random() * 100);
            difficulty.setDifficultyLevel(difficulty.getDifficultyPercentage() > 70 ? "Hard" : 
                                        difficulty.getDifficultyPercentage() > 30 ? "Medium" : "Easy");
            difficulties.add(difficulty);
        }
        
        analysis.setQuestionDifficulties(difficulties);
        analysis.setMostMissedQuestions(Arrays.asList("Question 2", "Question 5"));
        analysis.setMostCorrectQuestions(Arrays.asList("Question 1", "Question 3"));
        
        Map<String, Double> topicPerformance = new HashMap<>();
        topicPerformance.put("Topic A", 75.5);
        topicPerformance.put("Topic B", 82.3);
        topicPerformance.put("Topic C", 68.7);
        analysis.setTopicPerformance(topicPerformance);
        
        return analysis;
    }
    
    private TestReviewResponse.AIReport generateTestAIReport(List<TestAttempt> attempts, 
                                                           TestReviewResponse.TestStatistics statistics,
                                                           TestReviewResponse.QuestionAnalysis questionAnalysis) {
        TestReviewResponse.AIReport report = new TestReviewResponse.AIReport();
        
        // Generate summary
        String summary = String.format("Test analysis for %d students shows an average score of %.1f%% with %s performance distribution.", 
                statistics.getTotalStudents(), 
                statistics.getAverageScore(),
                statistics.getAverageScore() >= 75 ? "good" : statistics.getAverageScore() >= 60 ? "moderate" : "poor");
        report.setSummary(summary);
        
        // Generate insights
        List<String> insights = new ArrayList<>();
        insights.add(String.format("Pass rate: %.1f%% (%d out of %d students passed)", 
                statistics.getPassRate(), 
                (int)(statistics.getPassRate() / 100 * statistics.getTotalStudents()),
                statistics.getTotalStudents()));
        
        if (statistics.getStandardDeviation() > 15) {
            insights.add("High score variance indicates mixed understanding levels in the class");
        }
        
        insights.add(String.format("Score range: %d - %d (spread of %d points)", 
                statistics.getLowestScore(), 
                statistics.getHighestScore(),
                statistics.getHighestScore() - statistics.getLowestScore()));
        
        report.setInsights(insights);
        
        // Generate recommendations
        List<String> recommendations = new ArrayList<>();
        if (statistics.getAverageScore() < 70) {
            recommendations.add("Consider reviewing difficult topics before the next test");
            recommendations.add("Provide additional practice materials for struggling students");
        }
        
        if (statistics.getPassRate() < 80) {
            recommendations.add("Schedule remedial sessions for students who failed");
        }
        
        recommendations.add("Analyze most missed questions to identify knowledge gaps");
        report.setRecommendations(recommendations);
        
        // Class performance assessment
        String classPerformance = statistics.getAverageScore() >= 80 ? "Excellent class performance" :
                                 statistics.getAverageScore() >= 70 ? "Good class performance" :
                                 statistics.getAverageScore() >= 60 ? "Average class performance" : "Below average class performance";
        report.setClassPerformance(classPerformance);
        
        // Areas of concern
        List<String> concerns = new ArrayList<>();
        if (statistics.getPassRate() < 70) {
            concerns.add("Low pass rate indicates significant learning gaps");
        }
        if (statistics.getStandardDeviation() > 20) {
            concerns.add("Large performance gap between top and bottom students");
        }
        report.setAreasOfConcern(concerns);
        
        // Suggested actions
        String suggestedActions = "Review test questions and provide detailed feedback to students. " +
                                "Consider offering retake opportunities for students who performed poorly. " +
                                "Adjust teaching methods based on identified knowledge gaps.";
        report.setSuggestedActions(suggestedActions);
        
        return report;
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
