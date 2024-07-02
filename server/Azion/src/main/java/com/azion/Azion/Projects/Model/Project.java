package com.azion.Azion.Projects.Model;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.User.Model.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name="projects_azion")
public class Project {
    
    @Id
    private String projectID;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @ManyToMany
    private Set<User> users;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "orgID")
    private Org org;
    
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
    
    public Set<User> getUsers() {
        return users;
    }
    
    public void setUsers(Set<User> users) {
        this.users = users;
    }
    
    public Project() {
    }
    
    public Project(String name, String description, LocalDate date, Set<User> users,Org org) {
        setName(name);
        setDescription(description);
        setDate(date);
        setUsers(users);
        setOrg(org);
    }
    
  
    
    
    
    
    
    
    
}
