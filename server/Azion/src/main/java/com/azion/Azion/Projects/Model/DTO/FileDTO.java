package com.azion.Azion.Projects.Model.DTO;

import com.azion.Azion.Projects.Type.SubmitType;
import com.azion.Azion.User.Model.DTO.UserDTO;



public class FileDTO {
    private String projectID;
    private UserDTO user;
    private byte[] fileData;
    private String link;
    private SubmitType submitType;
    private String fileName;
    private String contentType;
    
    
    public String getProjectID() {
        return projectID;
    }
    
    public void setProjectID(String projectID) {
        this.projectID = projectID;
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
}
