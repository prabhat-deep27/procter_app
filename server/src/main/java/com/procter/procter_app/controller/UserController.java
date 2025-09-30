package com.procter.procter_app.controller;

import com.procter.procter_app.model.User;
import com.procter.procter_app.service.CloudinaryService;
import com.procter.procter_app.dto.UpdateProfileRequest;
import com.procter.procter_app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    public UserController(UserService userService, CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Handles profile updates for users with the 'STUDENT' role.
     * The frontend should continue to call PUT /api/users/profile for students.
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateStudentProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("profileData") UpdateProfileRequest profileData,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        String imageUrl = null;
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadFile(profilePicture);
            } catch (IOException e) {
                // Log the exception properly in a real application
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("Error uploading profile picture.");
            }
        }

        // Call a service method specifically for updating a student's profile
        return userService.updateStudentProfile(currentUser.getId(), profileData, imageUrl)
                .map(updatedUser -> ResponseEntity.ok().body("Profile updated successfully for student: " + updatedUser.getUsername()))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Handles profile updates for users with the 'TEACHER' role.
     * Note the new, more specific path to avoid conflicts.
     */
    @PutMapping("/teacher/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateTeacherProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("profileData") UpdateProfileRequest profileData,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        String imageUrl = null;
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadFile(profilePicture);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("Error uploading profile picture.");
            }
        }

        // Call the existing service method for updating a teacher's profile
        return userService.updateTeacherProfile(currentUser.getId(), profileData, imageUrl)
                .map(updatedUser -> ResponseEntity.ok().body("Profile updated successfully for teacher: " + updatedUser.getUsername()))
                .orElse(ResponseEntity.notFound().build());
    }
}