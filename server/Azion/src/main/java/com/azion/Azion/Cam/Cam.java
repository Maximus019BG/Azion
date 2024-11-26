package com.azion.Azion.Cam;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table
public class Cam {
    
    @Id
    private String id;
    
    @Column
    private String orgAddress;
    
    @Column
    private String camName; //Camera id
    
    @OneToOne
    private CamLog log;
    
    @Column
    private int roleLevel;
    
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
    
    public int getRoleLevel() {
        return roleLevel;
    }
    
    public void setRoleLevel(int roleLevel) {
        this.roleLevel = roleLevel;
    }
}
