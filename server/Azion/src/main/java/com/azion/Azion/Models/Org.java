package com.azion.Azion.Models;


import com.azion.Azion.Enums.OrgType;
import com.azion.Azion.Utils.OrgUtility;
import com.azion.Azion.Utils.StripeUtil;
import com.azion.Azion.Utils.UserUtility;
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
    
    @Column(nullable = true)
    private String subscriptionID;
    
    @Column(nullable = true)
    private String customerID;
    
    @Column(nullable = true, columnDefinition = "INT DEFAULT 0")
    private Long employeeCount;
    
    @Column(nullable = false, columnDefinition = "INT DEFAULT 5")
    private Long maxEmployeeCount = 5L;
    
    @Column(nullable = false)
    private OrgType plan;
    
    //Employees
    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
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
        if (orgName.contains(" ")) {
            throw new IllegalArgumentException("Name contains spaces");
        }
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
        
        if (!OrgUtility.isValidOrgEmail(orgEmail)) {
            throw new IllegalArgumentException("Invalid email format");
        } else {
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
        if (!UserUtility.isValidPhone(orgPhone)) {
            throw new IllegalArgumentException("Invalid phone number");
        }
        this.orgPhone = orgPhone;
    }
    
    public String getOrgDescription() {
        return orgDescription;
    }
    
    public void setOrgDescription(String orgDescription) {
        this.orgDescription = orgDescription;
    }
    
    public Long getEmployeeCount() {
        return employeeCount;
    }
    
    public void setEmployeeCount(Long employeeCount) {
        this.employeeCount = employeeCount;
    }
    
    public String getSubscriptionID() throws Exception {
        if (subscriptionID == null || subscriptionID.isEmpty()) {
            return null;
        }
        return StripeUtil.decrypt(subscriptionID);
    }
    
    public void setSubscriptionID(String subscriptionID) throws Exception {
        if (subscriptionID == null || subscriptionID.isEmpty()) {
            this.subscriptionID = null;
        }
        this.subscriptionID = StripeUtil.encrypt(subscriptionID);
    }
    
    public Long getMaxEmployeeCount() {
        return maxEmployeeCount;
    }
    
    public void setMaxEmployeeCount(Long maxEmployeeCount) {
        this.maxEmployeeCount = maxEmployeeCount;
    }
    
    public OrgType getPlan() {
        return plan;
    }
    
    public void setPlan(OrgType plan) {
        this.plan = plan;
    }
    
    public String getCustomerID() throws Exception {
        if (customerID == null || customerID.isEmpty()) {
            return null;
        }
        return StripeUtil.decrypt(customerID);
    }
    
    public void setCustomerID(String customerID) throws Exception {
        if (customerID == null || customerID.isEmpty()) {
            this.customerID = null;
        } else {
            this.customerID = StripeUtil.encrypt(customerID);
        }
    }
    
    
    @PrePersist
    private void PrePersist() {
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
