package com.azion.Azion.Models.DTO;

import com.azion.Azion.Enums.UserType;

import java.util.Set;

public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String age;
    private RoleDTO role;
    private String access;
    private String orgid;
    private Set<TasksDTO> projects;
    private String profilePicture;
    private boolean mfaEnabled;
    private boolean faceIdEnabled;
    private UserType userType;
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAge() {
        return age;
    }
    
    public void setAge(String age) {
        this.age = age;
    }
    
    public String getOrgid() {
        return orgid;
    }
    
    public void setOrgid(String orgid) {
        this.orgid = orgid;
    }
    
    public RoleDTO getRole() {
        return role;
    }
    
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    
    public Set<TasksDTO> getProjects() {
        return projects;
    }
    
    public void setProjects(Set<TasksDTO> projects) {
        this.projects = projects;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public boolean isMfaEnabled() {
        return mfaEnabled;
    }
    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
    }
    public boolean isFaceIdEnabled() {
        return faceIdEnabled;
    }
    
    public void setFaceIdEnabled(boolean faceIDEnabled) {
        this.faceIdEnabled = faceIDEnabled;
    }
    
    public String getAccess() {
        return access;
    }
    
    public void setAccess(String access) {
        this.access = access;
    }
    
    public UserType getUserType() {
        return userType;
    }
    
    public void setUserType(UserType userType) {
        this.userType = userType;
    }
    
}
