package com.procter.procter_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    // 🔹 Explicitly name the bean so SecurityConfig can find it using @Qualifier
    @Bean(name = "corsConfigurationSource")
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // Allow your React Vite frontend
        cfg.setAllowedOrigins(List.of("http://localhost:5173","https://docker-neon.vercel.app/"));

        // Standard HTTP methods allowed for your 2026 API
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Essential headers for JWT authentication and JSON requests
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Origin", "Accept"));

        // Allow the browser to read the Authorization header from responses
        cfg.setExposedHeaders(List.of("Authorization"));

        // Required for HttpOnly cookies or specific authenticated cross-origin requests
        cfg.setAllowCredentials(true);

        // Cache preflight (OPTIONS) response for 1 hour
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all endpoints
        source.registerCorsConfiguration("/**", cfg);

        return source;
    }
}
