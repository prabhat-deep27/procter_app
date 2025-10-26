package com.procter.procter_app.repo;

import com.procter.procter_app.model.TestAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends MongoRepository<TestAttempt, String> {
    List<TestAttempt> findByStudentIdAndIsCompletedTrueOrderByCompletedAtDesc(String studentId);
    List<TestAttempt> findByTestIdAndStudentId(String testId, String studentId);
    List<TestAttempt> findByStudentId(String studentId);
    boolean existsByTestIdAndStudentIdAndIsCompletedTrue(String testId, String studentId);
    List<TestAttempt> findByTestId(String testId);
}
