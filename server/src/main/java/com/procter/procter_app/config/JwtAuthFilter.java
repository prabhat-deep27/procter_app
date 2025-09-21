package com.procter.procter_app.config;

import com.procter.procter_app.model.User;
import com.procter.procter_app.repo.UserRepository;
import com.procter.procter_app.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // Skip if already authenticated
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();

        String header = request.getHeader("Authorization");
        if (existing == null && StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Jws<Claims> jws = jwtService.parse(token);
                String email = jws.getBody().getSubject();

                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    // Build authorities with ROLE_ prefix
                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

                    AbstractAuthenticationToken authentication =
                            new AbstractAuthenticationToken(List.of(authority)) {
                                @Override
                                public Object getCredentials() {
                                    return token;
                                }

                                @Override
                                public Object getPrincipal() {
                                    return user;
                                }
                            };
                    authentication.setAuthenticated(true);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Optional: log at debug level, do not break the chain on token issues
                // logger.debug("JWT parsing/validation failed", e);
            }
        }

        chain.doFilter(request, response);
    }
}
