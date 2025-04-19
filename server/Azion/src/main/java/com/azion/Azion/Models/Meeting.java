package com.azion.Azion.Models;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;


@Entity
@Table(name = "meetings_azion")
public class Meeting {
    
    @Id
    @Column(nullable = false)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private boolean allDay;
    
    @Column(nullable = true)
    private Date start;
    
    @Column(nullable = true)
    private Date end;
    
    @Column(nullable = false)
    private String link;
    
    @ManyToOne
    @JoinColumn(name = "org_id", nullable = false)
    private Org org;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "meeting_roles", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "role")
    private List<String> roles;
    
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
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public Date getStart() {
        return start;
    }
    
    public void setStart(Date start) {
        this.start = start;
    }
    
    public boolean isAllDay() {
        return allDay;
    }
    
    public void setAllDay(boolean allDay) {
        this.allDay = allDay;
    }
    
    public Date getEnd() {
        return end;
    }
    
    public void setEnd(Date end) {
        this.end = end;
    }
    
    public String getLink() {
        return link;
    }
    
    public void setLink(String link) {
        this.link = link;
    }
    
    public Org getOrg() {
        return org;
    }
    
    public void setOrg(Org org) {
        this.org = org;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

}
