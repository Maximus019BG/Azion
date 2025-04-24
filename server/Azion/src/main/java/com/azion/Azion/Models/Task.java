package com.azion.Azion.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tasks_azion")
public class Task {
    
    @Id
    private String projectID;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false, name = "date")
    private LocalDate date;
    
    @Column(nullable = false)
    private String priority;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @JsonIgnore
    @ManyToMany
    private Set<User> users;
    
    @JsonIgnore
    @ManyToMany
    private Set<User> doneBy;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "orgID")
    private Org org;
    
    @Column(nullable = false)
    private int progress;
    
    @Column(nullable = false)
    private String status;
    
    @Column(nullable = true)
    private String source;
    
    @JoinColumn
    @OneToMany
    private List<TaskFiles> taskFiles;
    
    
    public Task() {
    }
    
    public Task(String name, String description, LocalDate date, Set<User> users, Org org) {
        setName(name);
        setDescription(description);
        setDate(date);
        setUsers(users);
        setOrg(org);
    }
    
    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.projectID = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public Org getOrg() {
        return org;
    }
    
    public void setOrg(Org org) {
        this.org = org;
    }
    
    public String getProjectID() {
        return projectID;
    }
    
    public void setProjectID(String projectID) {
        this.projectID = projectID;
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
    
    public Set<User> getUsers() {
        return users;
    }
    
    public void setUsers(Set<User> users) {
        this.users = users;
    }
    
    public Set<User> getDoneBy() {
        return doneBy;
    }
    
    public void setDoneBy(Set<User> doneBy) {
        this.doneBy = doneBy;
    }
    
    public int getProgress() {
        return progress;
    }
    
    public void setProgress(int progress) {
        this.progress = progress;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public List<TaskFiles> getFiles() {
        return taskFiles;
    }
    
    public void setFiles(List<TaskFiles> taskFiles) {
        this.taskFiles = taskFiles;
    }
    
}
