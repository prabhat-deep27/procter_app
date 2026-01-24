package com.procter.procter_app.service;

import com.procter.procter_app.model.Test;
import com.procter.procter_app.repo.TestRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TestService {

    private final TestRepository testRepository;

    public TestService(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    // The service is now much simpler.
    // When you save a Test object, MongoDB automatically saves the embedded questions with it.
    public Test createTest(Test test) {
        return testRepository.save(test);
    }

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    // other methods as needed...
}
