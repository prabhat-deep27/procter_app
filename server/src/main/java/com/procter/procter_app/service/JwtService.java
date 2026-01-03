package com.procter.procter_app.service;

import com.procter.procter_app.model.User;
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

    /* ===================== INTERNAL ===================== */

    private byte[] resolveSecret(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException(
                    "FATAL: The 'app.jwt.secret' property is missing or blank in application.properties."
            );
        }

        byte[] decodedKey;
        if (secret.startsWith("BASE64:")) {
            decodedKey = Base64.getDecoder()
                    .decode(secret.substring("BASE64:".length()));
        } else {
            decodedKey = secret.getBytes();
        }

        if (decodedKey.length < 32) {
            throw new IllegalArgumentException(
                    "FATAL: JWT secret must be at least 256 bits (32 bytes). Current: "
                            + (decodedKey.length * 8) + " bits"
            );
        }

        return decodedKey;
    }

    /* ===================== TOKEN CREATION ===================== */

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

    /* ===================== TOKEN PARSING ===================== */

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    /* ===================== 🔥 ADDED METHODS ===================== */

    /**
     * ✅ Extract username (email) from token
     */
    public String extractUsername(String token) {
        return parse(token).getBody().getSubject();
    }

    /**
     * ✅ Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        Date expiration = parse(token).getBody().getExpiration();
        return expiration.before(new Date());
    }

    /**
     * ✅ Validate token against user
     */
    public boolean isTokenValid(String token, User user) {
        try {
            String username = extractUsername(token);
            return username.equals(user.getEmail()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * (Optional helper) Extract any claim
     */
    public Object extractClaim(String token, String claimKey) {
        return parse(token).getBody().get(claimKey);
    }
}
