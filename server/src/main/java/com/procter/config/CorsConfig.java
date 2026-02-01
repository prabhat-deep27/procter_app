package com.procter.procter_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // ✅ EXACT frontend origins (NO trailing slash)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://docker-neon.vercel.app"
        ));

        // ✅ Allow all required HTTP methods
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // ✅ Allow all headers (important for JWT & preflight)
        config.setAllowedHeaders(List.of("*"));

        // ✅ Allow browser to read Authorization header
        config.setExposedHeaders(List.of("Authorization"));

        // ✅ Required when using JWT + cookies / auth
        config.setAllowCredentials(true);

        // ✅ Cache OPTIONS response
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Apply to ALL endpoints including /ws/**
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

