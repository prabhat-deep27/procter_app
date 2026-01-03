package com.procter.procter_app.config;

import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.UserRepository;
import com.procter.procter_app.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Skip if no Bearer token
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        final String email;

        try {
            email = jwtService.extractUsername(token);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Proceed only if email is present and not already authenticated
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();

            // 3. Validate token against database user
            if (!jwtService.isTokenValid(token, user)) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            /*
               🔹 FIX: Use exact Authority name (e.g., "STUDENT")
               We do NOT use "ROLE_" prefix because SecurityConfig is now
               using .hasAuthority("STUDENT")
            */
            String roleName = user.getRole().name().toUpperCase();
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user, // Principal: The full User object for @AuthenticationPrincipal
                            null, // Credentials
                            List.of(authority) // Authorities
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // SERVER-SIDE DEBUG LOGS
            System.out.println("✅ JWT AUTH SUCCESSFUL");
            System.out.println("   📧 Email: " + user.getEmail());
            System.out.println("   🔑 Authority Granted: " + authority.getAuthority());
        }

        filterChain.doFilter(request, response);
    }
}
