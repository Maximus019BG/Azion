package com.azion.Azion.Chat.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.azion.Azion.Chat.Model.Chat;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequestMapping("/api/chat")
public class ChatController {
    private ConcurrentHashMap<String, List<Chat>> userMessages = new ConcurrentHashMap<>();

    @MessageMapping("/sendMessage")
    @SendToUser("/queue/messages")
    public Chat sendMessage(Chat message) {
        userMessages.computeIfAbsent(message.getReceiver(), k -> new ArrayList<>()).add(message);
        return message;
    }

    @GetMapping("/messages")
    @ResponseBody
    public List<Chat> getMessages(@RequestParam String user) {
        return userMessages.getOrDefault(user, new ArrayList<>());
    }
}