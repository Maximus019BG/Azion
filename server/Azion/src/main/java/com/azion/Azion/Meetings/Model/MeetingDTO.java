package com.azion.Azion.Meetings.Model;


import com.azion.Azion.Meetings.Enum.EnumDays;
import com.azion.Azion.User.Model.DTO.UserDTO;

import java.util.List;

public class MeetingDTO {
    private String id;
    private String topic;
    private String description;
    private Enum<EnumDays> day;
    private String start;
    private String end;
    private String link;
    private List<UserDTO> users;
    
    
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
    
    public List<UserDTO> getUsers() {
        return users;
    }
    
    public void setUsers(List<UserDTO> users) {
        this.users = users;
    }
}
