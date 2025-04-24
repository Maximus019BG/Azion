package com.azion.Azion.Models;

import com.azion.Azion.Enums.SubmitType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "task_files_azion")
public class TaskFiles {
    
    @Id
    private String taskFileID;
    
    @JoinColumn(nullable = true)
    @ManyToOne
    private User user;
    
    @Lob
    @Column(name = "fileData", columnDefinition = "LONGBLOB")
    private byte[] fileData;
    
    @Column(nullable = false)
    private LocalDate date;
    
    //!If they send link
    @Column
    private String link;
    
    //!type of submit(Link,Text, TaskFiles)
    @Enumerated(EnumType.STRING)
    @Column
    private SubmitType submitType;
    
    @Column
    private String fileName;
    
    @Column
    private String contentType;
    
    
    public TaskFiles() {
    }
    
    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.taskFileID = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }
    
    public String getTaskID() {
        return taskFileID;
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
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
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
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
}
