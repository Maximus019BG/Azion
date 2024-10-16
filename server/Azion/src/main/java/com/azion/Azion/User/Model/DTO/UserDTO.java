package com.azion.Azion.User.Model.DTO;

import com.azion.Azion.Projects.Model.DTO.ProjectsDTO;
import com.azion.Azion.Projects.Model.Project;

import java.util.Date;
import java.util.Set;

public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String age;
    private String role;
    private Integer roleLevel;
    private String orgid;
    private Set<ProjectsDTO> projects;
    private String profilePicture;
    
    
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
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Integer getRoleLevel() {
        return roleLevel;
    }
    
    public void setRoleLevel(Integer roleLevel) {
        this.roleLevel = roleLevel;
    }
    
    public Set<ProjectsDTO> getProjects() {
        return projects;
    }
    
    public void setProjects(Set<ProjectsDTO> projects) {
        this.projects = projects;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
