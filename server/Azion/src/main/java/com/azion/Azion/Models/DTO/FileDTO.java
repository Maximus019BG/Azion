package com.azion.Azion.Models.DTO;

import com.azion.Azion.Enums.SubmitType;


public class FileDTO {
    private String taskID;
    private UserDTO user;
    private byte[] fileData;
    private String link;
    private SubmitType submitType;
    private String fileName;
    private String contentType;
    private String date;
    
    public String getTaskID() {
        return taskID;
    }
    
    public void setTaskID(String taskID) {
        this.taskID = taskID;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public void setUser(UserDTO user) {
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
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
}
