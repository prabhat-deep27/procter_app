package com.procter.procter_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        String[] allowedOrigins = new String[]{
            "http://localhost:5173",
            "https://docker-neon.vercel.app",
            "https://www.docker-neon.vercel.app"
        };

        // Plain WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins);

        // SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}

