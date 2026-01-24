package com.procter.procter_app.controller;

import com.procter.procter_app.model.User;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.Map;

@Controller
public class ProctoringController {

    private final SimpMessagingTemplate messagingTemplate;

    public ProctoringController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Students can send activity pings/events to the teacher's topic for a given test
    @MessageMapping("/test/{testId}/activity")
    public void activity(@DestinationVariable String testId,
                         @Payload Map<String, Object> payload,
                         @AuthenticationPrincipal User user) {
        messagingTemplate.convertAndSend("/topic/test/" + testId + "/events",
                Map.of(
                        "type", "ACTIVITY",
                        "userId", user != null ? user.getId() : "unknown",
                        "payload", payload,
                        "timestamp", Instant.now().toString()
                ));
    }
}
