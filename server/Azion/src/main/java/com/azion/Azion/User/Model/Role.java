package com.azion.Azion.User.Model;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Tasks.Model.Task;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "roles_azion")
public class Role {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "roleAccess", nullable = true, columnDefinition = "CHAR(8) DEFAULT 00000000")
    private String roleAccess;
    
    @Column(name = "color", nullable = true, columnDefinition = "CHAR(8) DEFAULT 00000000")
    private String color;
    
    @OneToMany
    private Set<User> users;
    
    @ManyToOne
    private Org org;
    
    public Org getOrg() {
        return org;
    }
    
    public void setOrg(Org orgs) {
        this.org = orgs;
    }
    
    public String getRoleAccess() {
        return roleAccess;
    }
    
    ///<summary>IN ORDER:
    /// Calendar                0
    ///
    /// Settings                1
    ///
    /// Employees               2
    ///
    /// Roles                   3
    ///
    /// Create Tasks            4
    ///
    /// View Tasks              5
    ///
    /// Azion Cameras (Write)   6
    ///
    /// Azion Cameras (Read)    7
    /// </summary>
    public void setRoleAccess(String roleLevel) {
        if(roleLevel.length() != 8){
            throw new RuntimeException("Impossible access");
        }
        this.roleAccess = roleLevel;
    }
    
    public String getId() {
        return id;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public Set<User> getUsers() {
        return users;
    }
    
    public void setUsers(Set<User> users) {
        this.users = users;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    private void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    @PrePersist
    public void prePersist() {
        generateId();
    }
    
    public Role() {
        //Empty constructor
    }
    
    public Role(String name, String roleAccess, String color) {
        this.name = name;
        this.roleAccess = roleAccess;
        this.color = color;
        generateId();
    }
    
}

