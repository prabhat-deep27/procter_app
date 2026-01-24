package com.procter.procter_app.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String username;
    private String email;
    private String profilePictureUrl;

    public AuthResponse(String token, String role, String username, String email, String profilePictureUrl) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
}
