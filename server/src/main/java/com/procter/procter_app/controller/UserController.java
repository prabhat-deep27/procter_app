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

    @PutMapping("/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("profileData") UpdateProfileRequest profileData,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        String imageUrl = null;
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                // Upload the image to Cloudinary and get its secure URL
                imageUrl = cloudinaryService.uploadFile(profilePicture);
            } catch (IOException e) {
                // In a real app, you should log this exception
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("Error uploading profile picture.");
            }
        }

        // Call the service to update the user's profile in the database
        return userService.updateTeacherProfile(currentUser.getId(), profileData, imageUrl)
                .map(updatedUser -> ResponseEntity.ok().body("Profile updated successfully for user: " + updatedUser.getUsername()))
                .orElse(ResponseEntity.notFound().build());
    }
}
