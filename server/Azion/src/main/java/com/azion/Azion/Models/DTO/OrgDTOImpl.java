package com.azion.Azion.Models.DTO;

import com.azion.Azion.Enums.OrgType;

public class OrgDTOImpl implements OrgDTO {
    private String orgID;
    private String orgName;
    private String orgType;
    private String orgAddress;
    private String orgEmail;
    private String orgPhone;
    private String orgDescription;
    private String customerID;
    private String subscriptionID;
    private Long maxEmployeeCount;
    private OrgType plan;
    private Long employeeCount;
    
    // Getters and Setters
    @Override
    public String getOrgID() {
        return orgID;
    }
    
    public void setOrgID(String orgID) {
        this.orgID = orgID;
    }
    
    @Override
    public String getOrgName() {
        return orgName;
    }
    
    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }
    
    @Override
    public String getOrgType() {
        return orgType;
    }
    
    public void setOrgType(String orgType) {
        this.orgType = orgType;
    }
    
    @Override
    public String getOrgAddress() {
        return orgAddress;
    }
    
    public void setOrgAddress(String orgAddress) {
        this.orgAddress = orgAddress;
    }
    
    @Override
    public String getOrgEmail() {
        return orgEmail;
    }
    
    public void setOrgEmail(String orgEmail) {
        this.orgEmail = orgEmail;
    }
    
    @Override
    public String getOrgPhone() {
        return orgPhone;
    }
    
    public void setOrgPhone(String orgPhone) {
        this.orgPhone = orgPhone;
    }
    
    @Override
    public String getOrgDescription() {
        return orgDescription;
    }
    
    public void setOrgDescription(String orgDescription) {
        this.orgDescription = orgDescription;
    }
    
    @Override
    public String getSubscriptionID() {
        return subscriptionID;
    }
    
    public void setSubscriptionID(String subscriptionID) {
        this.subscriptionID = subscriptionID;
    }
    
    @Override
    public Long getMaxEmployeeCount() {
        return maxEmployeeCount;
    }
    
    public void setMaxEmployeeCount(Long maxEmployeeCount) {
        this.maxEmployeeCount = maxEmployeeCount;
    }
    
    @Override
    public OrgType getPlan() {
        return plan;
    }
    
    public void setPlan(OrgType plan) {
        this.plan = plan;
    }
    
    @Override
    public Long getEmployeeCount() {
        return employeeCount;
    }
    
    public void setEmployeeCount(Long employeeCount) {
        this.employeeCount = employeeCount;
    }
    
    public String getCustomerID() {
        return customerID;
    }
    
    public void setCustomerID(String customerID) {
        this.customerID = customerID;
    }
}