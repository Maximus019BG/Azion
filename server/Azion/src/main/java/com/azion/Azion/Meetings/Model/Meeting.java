package com.azion.Azion.Meetings.Model;

import com.azion.Azion.Meetings.Enum.EnumDays;
import com.azion.Azion.User.Model.User;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;


@Entity
@Table(name = "meetings_azion")
public class Meeting {
    
    @Id
    @Column(nullable = false)
    private String id;
    
    @Column(nullable = false)
    private String topic;
    
    @Column
    private String description;
    
    @Column(nullable = false)
    private Enum<EnumDays> day;
    
    @Column(nullable = false)
    private String start;
    
    @Column(nullable = false)
    private String end;
    
    @Column
    private String link;
    
    @ManyToMany
    private List<User> users;
    
    private void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    @PrePersist
    private void prePersist() {
        generateId();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTopic() {
        return topic;
    }
    
    public void setTopic(String topic) {
        this.topic = topic;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Enum<EnumDays> getDay() {
        return day;
    }
    
    public void setDay(Enum<EnumDays> day) {
        this.day = day;
    }
    
    public String getStart() {
        return start;
    }
    
    public void setStart(String start) {
        this.start = start;
    }
    
    public String getEnd() {
        return end;
    }
    
    public void setEnd(String end) {
        this.end = end;
    }
    
    public String getLink() {
        return link;
    }
    
    public void setLink(String link) {
        this.link = link;
    }
    
    public List<User> getUsers() {
        return users;
    }
    
    public void setUsers(List<User> users) {
        this.users = users;
    }
}
