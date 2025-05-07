package com.azion.Azion.Controllers;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class SignalingController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    @MessageMapping("/signal/{receiverEmail}")
    public void signal(
            @DestinationVariable String receiverEmail,
            @Payload String message,
            Principal principal
    ) {
        
        messagingTemplate.convertAndSend("/user/" + receiverEmail + "/signal", message);
    }
    
}
