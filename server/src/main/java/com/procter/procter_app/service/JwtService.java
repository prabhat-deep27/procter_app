package com.procter.procter_app.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(resolveSecret(secret));
        this.expirationMs = expirationMs;
    }

    private byte[] resolveSecret(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("FATAL: The 'app.jwt.secret' property is missing or blank in your application.properties.");
        }

        byte[] decodedKey;
        if (secret.startsWith("BASE64:")) {
            // *** THIS IS THE FIX: Revert back to the standard decoder ***
            decodedKey = Base64.getDecoder().decode(secret.substring("BASE64:".length()));
        } else {
            decodedKey = secret.getBytes();
        }

        if (decodedKey.length < 32) {
            throw new IllegalArgumentException(
                    "FATAL: The provided JWT secret key is only " + (decodedKey.length * 8) + " bits. " +
                            "It MUST be at least 256 bits (32 bytes) for HS256."
            );
        }
        return decodedKey;
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}
