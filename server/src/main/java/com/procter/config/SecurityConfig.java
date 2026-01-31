package com.procter.procter_app.config;

import com.procter.procter_app.repo.UserRepository;
import com.procter.procter_app.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public SecurityConfig(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // use CorsConfig bean
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .logout(l -> l.disable())
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/ws/**"
                        ).permitAll()

                        // Allow all OPTIONS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // STUDENT-specific
                        .requestMatchers(HttpMethod.GET, "/api/analytics/my-analytics").hasRole("STUDENT")

                        // Auth test
                        .requestMatchers(HttpMethod.GET, "/api/analytics/test-auth").authenticated()

                        // Everything else
                        .anyRequest().authenticated()
                )
                // JWT filter
                .addFilterBefore(
                        new com.procter.procter_app.config.JwtAuthFilter(jwtService, userRepository),
                        BasicAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}

