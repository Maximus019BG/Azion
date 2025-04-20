package com.azion.Azion.Controllers;

import com.azion.Azion.Models.DTO.MessageDTO;
import com.azion.Azion.Models.Message;
import com.azion.Azion.Repositories.MessageRepository;
import com.azion.Azion.Services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RestController
@RequestMapping
public class ChatController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final MessageRepository messageRepository;
    
    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService, MessageRepository messageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.messageRepository = messageRepository;
    }
    
    @MessageMapping("/privateMessage")
    public void sendPrivateMessage(MessageDTO messageDTO) {
        // Set the current time if not provided in the WebSocket message
        if (messageDTO.getTime() == null) {
            messageDTO.setTime(LocalDateTime.now());
        }
        
        Message message = new Message();
        message.setFromUser(messageDTO.getFrom());
        message.setToUser(messageDTO.getTo());
        message.setTime(messageDTO.getTime());
        
        try {
            message.setContent(messageDTO.getContent());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        messageRepository.save(message);
        messagingTemplate.convertAndSendToUser(messageDTO.getTo(), "/private", messageDTO);
    }
    
    @GetMapping("/api/getOldMessages/{user1}/{user2}")
    public List<MessageDTO> getOldMessages(@PathVariable String user1, @PathVariable String user2) {
        return messageService.getOldMessagesForUser(user1, user2);
    }
    
    @DeleteMapping("/api/deleteMessage/{id}")
    public void deleteMessage(@PathVariable String id) {
        Message message = messageRepository.findById(id).orElse(null);
        if (message != null) {
            messageRepository.delete(message);
        }
    }
    
    @PutMapping("/api/updateMessage/{id}")
    public void updateMessage(@PathVariable String id, @RequestBody MessageDTO messageDTO) throws Exception {
        Message message = messageRepository.findById(id).orElse(null);
        if (message != null) {
            message.setContent(messageDTO.getContent());
            message.setEdited(true);
            messageRepository.save(message);
        }
    }
    
}