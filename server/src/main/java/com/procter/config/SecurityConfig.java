package com.procter.procter_app.config;

import com.procter.procter_app.repo.UserRepository;
import com.procter.procter_app.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebSecurity
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
            // ❌ Disable defaults not used in JWT
            .csrf(csrf -> csrf.disable())
            .httpBasic(b -> b.disable())
            .formLogin(f -> f.disable())
            .logout(l -> l.disable())

            // ✅ Enable CORS
            .cors(Customizer.withDefaults())

            // ✅ Stateless JWT
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ✅ Authorization rules (ORDER MATTERS!)
            .authorizeHttpRequests(auth -> auth

                // 🔥 MUST BE FIRST (browser preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 🔓 Public authentication APIs
                .requestMatchers("/api/auth/**").permitAll()

                // 🔓 WebSocket handshake + SockJS
                .requestMatchers("/ws/**").permitAll()

                // 👨‍🎓 Student-only endpoint
                .requestMatchers(HttpMethod.GET, "/api/analytics/my-analytics")
                    .hasRole("STUDENT")

                // 🔐 Any authenticated test endpoint
                .requestMatchers("/api/analytics/test-auth")
                    .authenticated()

                // 🔐 Everything else
                .anyRequest().authenticated()
            )

            // ✅ JWT Filter
            .addFilterBefore(
                new JwtAuthFilter(jwtService, userRepository),
                BasicAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}

