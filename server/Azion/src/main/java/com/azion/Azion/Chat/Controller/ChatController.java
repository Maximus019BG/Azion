package com.azion.Azion.Chat.Controller;

import com.azion.Azion.Chat.Model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage")
    public void broadcastMessage(Message message) {
        messagingTemplate.convertAndSend("/topic/messages", message);
    }

    @MessageMapping("/privateMessage")
    public void sendPrivateMessage(Message message) {
        messagingTemplate.convertAndSendToUser(message.getTo(), "/private", message);
    }
    
    
}