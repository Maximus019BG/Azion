package com.azion.Azion.Cam;

import com.azion.Azion.User.Model.Role;

import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table
public class Cam {
    
    @Id
    private String id;
    
    @Column
    private String orgAddress;
    
    @Column
    private String camName;
    
    @OneToOne
    private CamLog log;
    
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
    
    @PrePersist
    public void prePersist() {
        generateId();
    }
    
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getOrgAddress() {
        return orgAddress;
    }
    
    public void setOrgAddress(String orgAddress) {
        this.orgAddress = orgAddress;
    }
    
    public void setOrgName(String orgAddress) {
        this.orgAddress = orgAddress;
    }
    
    public String getCamName() {
        return camName;
    }
    
    public void setCamName(String camName) {
        this.camName = camName;
    }
    
    public CamLog getLog() {
        return log;
    }
    
    public void setLog(CamLog log) {
        this.log = log;
    }
    
    public Role getRole() {
        return this.role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
}
