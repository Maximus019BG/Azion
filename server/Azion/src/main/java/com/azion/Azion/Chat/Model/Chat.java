package com.azion.Azion.Chat.Model;

import org.springframework.stereotype.Component;

@Component
public class Chat {
    private String message;
    private String sender;
    private String receiver;

    public Chat() {
    }

    public Chat(String message, String sender) {
        this.message = message;
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }
    
    public String getReceiver() {
        return receiver;
    }
    
    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }
}
