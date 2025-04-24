package com.azion.Azion.Models;

import com.azion.Azion.Utils.MessageUtil;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages_azion")
public class Message {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String fromUser;
    
    @Column(nullable = false)
    private String toUser;
    
    @Column(nullable = false)
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime time;
    
    @Column(nullable = false)
    private boolean edited;
    
    private void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        setId(uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis());
    }
    
    @PrePersist
    private void prePersist() {
        generateId();
    }
    
    public String getId() {
        return id;
    }
    
    private void setId(String id) {
        this.id = id;
    }
    
    public String getFromUser() {
        return fromUser;
    }
    
    public void setFromUser(String from) {
        this.fromUser = from;
    }
    
    public String getToUser() {
        return toUser;
    }
    
    public void setToUser(String to) {
        this.toUser = to;
    }
    
    public String getContent() throws Exception {
        return MessageUtil.decrypt(this.content);
    }
    
    public void setContent(String content) throws Exception {
        this.content = MessageUtil.encrypt(content);
    }
    
    public LocalDateTime getTime() {
        return time;
    }
    
    public void setTime(LocalDateTime time) {
        this.time = time;
    }
    
    public boolean isEdited() {
        return edited;
    }
    
    public void setEdited(boolean edited) {
        this.edited = edited;
    }
}