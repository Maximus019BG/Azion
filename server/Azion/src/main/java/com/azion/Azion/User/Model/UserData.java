package com.azion.Azion.User.Model;

import com.azion.Azion.Projects.Model.Project;
import lombok.Getter;

import java.util.Date;
import java.util.Set;

public class UserData {
    private String name;
    private String email;
    private Date age;
    private String role;
    private String orgid;
    private Set<Project> projects;
    
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
    
    public Date getAge() {
        return age;
    }
    
    public void setAge(Date age) {
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
    
    public Set<Project> getProjects() {
        return projects;
    }
    
    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }
}
