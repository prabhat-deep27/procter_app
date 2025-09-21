package com.procter.procter_app.repo;

import com.procter.procter_app.model.Test;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestRepository extends MongoRepository<Test, String> {
    Optional<Test> findByJoinCode(String joinCode);
    List<Test> findAllByCreatedByTeacherId(String teacherId);
    // For MongoDB queries, use custom query annotation or query method
    @Query("{ 'subject': ?0, '$or': [ {'createdByTeacherId': ?1}, {'participantIds': ?1} ] }")
    List<Test> findBySubjectAndUserInvolvement(String subject, String userId);
}
