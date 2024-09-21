package com.azion.Azion.Org.Model;


import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Util.UserUtility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.mindrot.jbcrypt.BCrypt;

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

    @Column(nullable = false, unique = true)
    private String orgAddress;

    @Column(nullable = false, unique = true)
    private String orgEmail;

    @Column(nullable = false, unique = true)
    private String orgConnectString;
    
    @Column(nullable = false)
    private String orgPhone;
    
    @Column(nullable = true)
    private String orgDescription;
   
    //Employees
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "orgID")
    private Set<User> users;


    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }


    
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        setOrgID(uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis());
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
        if (!OrgUtility.isValidOrgAddress(orgAddress)) {
            throw new IllegalArgumentException("Invalid address format");
        }
        this.orgAddress = orgAddress;
    }

    public String getOrgEmail() {
        return orgEmail;
    }

    public void setOrgEmail(String orgEmail) {

        if (!OrgUtility.isValidOrgEmail(orgEmail)) {
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
        this.orgConnectString = OrgUtility.encrypt(orgConnectString);
    }

public void generateConString() {
    String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    StringBuilder formattedString = new StringBuilder(uuid);

    for (int i = 4; i < formattedString.length(); i += 5) {
        formattedString.insert(i, "-");
    }

    this.orgConnectString = OrgUtility.encrypt(formattedString.toString());
}
    
    public String getOrgPhone() {
        return orgPhone;
    }
    
    public void setOrgPhone(String orgPhone) {
        this.orgPhone = orgPhone;
    }
    
    public String getOrgDescription() {
        return orgDescription;
    }
    
    public void setOrgDescription(String orgDescription) {
        this.orgDescription = orgDescription;
    }
    
    @PrePersist
    private void PrePersist(){
        generateId();
        generateConString();
    }

    public Org() {
    }

    public Org(String orgName, String orgType, String orgAddress, String orgEmail, Set<User> users, String orgPhone, String orgDescription) {
        setOrgName(orgName);
        setOrgType(orgType);
        setOrgAddress(orgAddress);
        setOrgEmail(orgEmail);
        setUsers(users);
        setOrgPhone(orgPhone);
        setOrgDescription(orgDescription);
    }


}
