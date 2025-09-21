package com.procter.procter_app.service;

import  com.procter.procter_app.dto.UpdateProfileRequest;
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
     * Updates the profile for a given teacher.
     *
     * @param userId The ID of the user to update.
     * @param request The DTO containing the department information.
     * @param imageUrl The new profile picture URL from Cloudinary (can be null).
     * @return An Optional containing the updated UserAccount, or empty if not found.
     */
    public Optional<User> updateTeacherProfile(String userId, UpdateProfileRequest request, String imageUrl) {
        return userRepository.findById(userId).map(user -> {
            if (user.getRole() != Role.TEACHER) {
                throw new IllegalStateException("Profile updates for department and picture are only allowed for teachers.");
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

