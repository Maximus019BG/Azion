package com.azion.Azion.Controllers;

import com.azion.Azion.Models.DTO.MessageDTO;
import com.azion.Azion.Models.Message;
import com.azion.Azion.Repositories.MessageRepository;
import com.azion.Azion.Services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        Message message = new Message();
        message.setFromUser(messageDTO.getFrom());
        message.setToUser(messageDTO.getTo());
        
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
    
}