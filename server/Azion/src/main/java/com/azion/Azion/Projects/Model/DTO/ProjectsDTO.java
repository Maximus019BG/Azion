package com.azion.Azion.Projects.Model.DTO;

import com.azion.Azion.User.Model.DTO.UserDTO;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectsDTO {
    private String id;
    private String name;
    private String description;
    private LocalDate date;
    private String priority;
    private String status;
    private int progress;
    private String source;
    private Set<UserDTO> users;
    private String orgId;
    private UserDTO createdBy;
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    public UserDTO getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(UserDTO createdBy) {
        this.createdBy = createdBy;
    }
    public int getProgress() {
        return progress;
    }
    
    public void setProgress(int progress) {
        this.progress = progress;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public Set<UserDTO> getUsers() {
        return users;
    }
    
    public void setUsers(Set<UserDTO> users) {
        this.users = users;
    }
    
    public String getOrgId() {
        return orgId;
    }
    
    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }
    
}