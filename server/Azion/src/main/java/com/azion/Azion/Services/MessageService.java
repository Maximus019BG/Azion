package com.azion.Azion.Services;

import com.azion.Azion.Models.DTO.MessageDTO;
import com.azion.Azion.Models.Message;
import com.azion.Azion.Repositories.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MessageService {
    
    private final MessageRepository messageRepository;
    
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }
    
    public List<MessageDTO> getOldMessagesForUser(String to, String from) {
        List<Message> messages = messageRepository.findMessageByToUserAndFromUser(to, from);
        List<Message> messages2 = messageRepository.findMessageByToUserAndFromUser(from, to);
        messages.addAll(messages2);
        
        List<MessageDTO> messageDTOs = new ArrayList<>();
        
        for (Message message : messages) {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setFrom(message.getFromUser());
            messageDTO.setTo(message.getToUser());
            try {
                messageDTO.setContent(message.getContent());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            messageDTOs.add(messageDTO);
        }
        
        return messageDTOs;
    }
}
