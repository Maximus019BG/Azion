package com.azion.Azion.Org.Model;


import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Util.UserUtility;
import jakarta.persistence.*;

import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "org_azion")
public class Org {

    @Id
    private String orgID;

    @Column(nullable = false)
    private String orgName;

    @Column(nullable = false)
    private String orgType;

    @Column(nullable = false)
    private String orgAddress;

    @Column(nullable = false, unique = true)
    private String orgEmail;

    @Column(nullable = false, unique = true)
    private String orgConnectString;

    //Employees
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "orgID")
    private Set<User> users;


    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }


    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.orgID = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }

    public String getOrgID() {
        return orgID;
    }

    public void setOrgID(String orgID) {
        this.orgID = orgID;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgType() {
        return orgType;
    }

    public void setOrgType(String orgType) {
        this.orgType = orgType;
    }

    public String getOrgAddress() {
        return orgAddress;
    }

    public void setOrgAddress(String orgAddress) {
        this.orgAddress = orgAddress;
    }

    public String getOrgEmail() {
        return orgEmail;
    }

    public void setOrgEmail(String orgEmail) {

        if (!UserUtility.isValidEmail(orgEmail)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        else{
            this.orgEmail = orgEmail;
        }

    }

    public String getOrgConnectString() {
        return orgConnectString;
    }

    public void setOrgConnectString(String orgConnectString) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.orgID = uuid.substring(0, Math.min(uuid.length(), 10)) + System.currentTimeMillis();
        this.orgConnectString = orgConnectString;
    }

    public Org() {
    }

    public Org(String orgName, String orgType, String orgAddress, String orgEmail, String orgConnectString, Set<User> users) {
        setOrgName(orgName);
        setOrgType(orgType);
        setOrgAddress(orgAddress);
        setOrgEmail(orgEmail);
        setOrgConnectString(orgConnectString);
        setUsers(users);
    }


}
