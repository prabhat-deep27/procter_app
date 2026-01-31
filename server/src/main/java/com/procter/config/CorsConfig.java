package com.procter.procter_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean(name = "corsConfigurationSource")
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration cfg = new CorsConfiguration();

        // ✅ FRONTEND URLs ONLY
        cfg.setAllowedOrigins(List.of(
                "http://localhost:5173",              // local Vite
                "https://docker-neon.vercel.app",     // deployed frontend
                "https://www.docker-neon.vercel.app"  // optional www version
        ));

        // ✅ Allowed HTTP methods
        cfg.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // ✅ Headers your frontend sends
        cfg.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Origin",
                "Accept"
        ));

        // ✅ Headers browser can read
        cfg.setExposedHeaders(List.of("Authorization"));

        // ✅ REQUIRED if using JWT / cookies
        cfg.setAllowCredentials(true);

        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);

        return source;
    }
}

