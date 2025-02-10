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
    @Column(nullable = false, length = 255, unique = true)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "roleAccess", nullable = true, columnDefinition = "VARCHAR(255)")
    private String roleAccess;

    @Column(name = "color", nullable = true, columnDefinition = "CHAR(8) DEFAULT '#000000'")
    private String color;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
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

    ///<summary>
    /// IN ORDER:
    ///
    /// Calendar                calendar:write
    ///
    /// Settings                settings:write  settings:read
    ///
    /// Employees               employees:read
    ///
    /// Roles                   roles:write     roles:read
    /// Create Tasks            tasks:write
    ///
    /// View Tasks              tasks:read
    ///
    /// Azion Cameras (Write)   cameras:write
    ///
    /// Azion Cameras (Read)    cameras:read
    /// </summary>
    public void setRoleAccess(String roleAccess) {
        this.roleAccess = roleAccess;
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