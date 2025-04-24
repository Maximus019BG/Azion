package com.azion.Azion.Models;

import com.azion.Azion.Utils.NetworkUtil;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "network_azion")
public class Network {
    @Id
    private String id;
    
    @Column(nullable = false, unique = false)
    private String name;
    
    @Column(nullable = false, unique = false, length = 500)
    private String description;
    
    @Column(nullable = false)
    private String unifyApiKey;
    
    @Column(nullable = false)
    private String siteId;
    
    @Column(nullable = false)
    private String hostId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private Org org;
    
    
    public Network() {
    }
    
    public Network(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
    
    @PrePersist
    private void prePersist() {
        generateId();
    }
    
    private void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public String getId() {
        return id;
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
    
    public String getUnifyApiKey() {
        return unifyApiKey;
    }
    
    public void setUnifyApiKey(String unifyApiKey) {
        this.unifyApiKey = NetworkUtil.encrypt(unifyApiKey);
    }
    
    public Org getOrg() {
        return org;
    }
    
    public void setOrg(Org org) {
        this.org = org;
    }
    
    public String getSiteId() {
        return siteId;
    }
    
    public void setSiteId(String siteId) {
        this.siteId = siteId;
    }
    
    public String getHostId() {
        return hostId;
    }
    
    public void setHostId(String hostId) {
        this.hostId = hostId;
    }
    
}
