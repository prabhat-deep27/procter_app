package com.procter.procter_app.controller;



import com.procter.procter_app.model.Role;
import com.procter.procter_app.dto.AuthResponse;
import com.procter.procter_app.dto.LoginRequest;
import com.procter.procter_app.dto.RegisterRequest;
import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.UserRepository;
import com.procter.procter_app.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.jwt.secret}") String secret,
                          @Value("${app.jwt.expiration}") long expirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = new JwtService(secret, expirationMs);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        User u = new User(
                req.getUsername(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getRole()
        );
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("status", "registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        User u = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtService.generateToken(
                u.getEmail(),
                Map.of("role", u.getRole().name(), "uid", u.getId())
        );
        return ResponseEntity.ok(new AuthResponse(
                token, 
                u.getRole().name(), 
                u.getUsername(), 
                u.getEmail(),
                u.getProfilePictureUrl()
        ));
    }
}