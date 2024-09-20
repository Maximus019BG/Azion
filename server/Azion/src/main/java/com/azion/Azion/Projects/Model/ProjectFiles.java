package com.azion.Azion.Projects.Model;

import com.azion.Azion.Projects.Type.SubmitType;
import com.azion.Azion.User.Model.User;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name="project_files_azion")
public class ProjectFiles {
    
    @Id
    private String projectID;
    
    @JoinColumn(nullable = false)
    @ManyToOne
    private User user;
    
    @Lob
    @Column(name = "fileData", columnDefinition = "LONGBLOB")
    private byte[] fileData;
    
    //!If they send link
    @Column
    private String link;
    
    //!type of submit(Link,Text, ProjectFiles)
    @Enumerated(EnumType.STRING)
    @Column
    private SubmitType submitType;
    
    
    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.projectID = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public String getProjectID() {
        return projectID;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public byte[] getFileData() {
        return fileData;
    }
    
    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }
    
    public String getLink() {
        return link;
    }
    
    public void setLink(String link) {
        this.link = link;
    }
    
    public SubmitType getSubmitType() {
        return submitType;
    }
    
    public void setSubmitType(SubmitType submitType) {
        this.submitType = submitType;
    }
    
    
    public ProjectFiles(){
    }
}
