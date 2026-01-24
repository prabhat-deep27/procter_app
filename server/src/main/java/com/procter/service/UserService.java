package com.procter.procter_app.service;

import com.procter.procter_app.dto.UpdateProfileRequest;
import com.procter.procter_app.model.Role;
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Updates the profile for a given student.
     *
     * @param userId The ID of the user to update.
     * @param request The DTO containing the profile information (username, email, department/course).
     * @param imageUrl The new profile picture URL (can be null).
     * @return An Optional containing the updated User, or empty if not found.
     */
    public Optional<User> updateStudentProfile(String userId, UpdateProfileRequest request, String imageUrl) {
        return userRepository.findById(userId).map(user -> {
            if (user.getRole() != Role.STUDENT) {
                // This check ensures we only apply student logic to students
                throw new IllegalStateException("This profile update operation is only for students.");
            }

            // Update username if a new value is provided
            if (request.getUsername() != null && !request.getUsername().isBlank()) {
                user.setUsername(request.getUsername());
            }

            // Update email if a new value is provided
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                user.setEmail(request.getEmail());
            }

            // Update department/course if a new value is provided
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                user.setDepartment(request.getDepartment());
            }

            // Update image URL if a new image was uploaded
            if (imageUrl != null && !imageUrl.isBlank()) {
                user.setProfilePictureUrl(imageUrl);
            }

            return userRepository.save(user);
        });
    }

    /**
     * Updates the profile for a given teacher.
     *
     * @param userId The ID of the user to update.
     * @param request The DTO containing the profile information.
     * @param imageUrl The new profile picture URL (can be null).
     * @return An Optional containing the updated User, or empty if not found.
     */
    public Optional<User> updateTeacherProfile(String userId, UpdateProfileRequest request, String imageUrl) {
        return userRepository.findById(userId).map(user -> {
            if (user.getRole() != Role.TEACHER) {
                throw new IllegalStateException("This profile update operation is only for teachers.");
            }

            // Update username if a new value is provided
            if (request.getUsername() != null && !request.getUsername().isBlank()) {
                user.setUsername(request.getUsername());
            }

            // Update email if a new value is provided
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                user.setEmail(request.getEmail());
            }

            // Update department if a new value is provided
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                user.setDepartment(request.getDepartment());
            }

            // Update image URL if a new image was uploaded
            if (imageUrl != null && !imageUrl.isBlank()) {
                user.setProfilePictureUrl(imageUrl);
            }

            return userRepository.save(user);
        });
    }
}