package com.azion.Azion.Models.DTO;

import com.azion.Azion.Enums.OrgType;

public interface OrgDTO {
    String getOrgID();
    String getOrgName();
    String getOrgType();
    String getOrgAddress();
    String getOrgEmail();
    String getOrgPhone();
    String getOrgDescription();
    
    String getSubscriptionID();
    
    Long getMaxEmployeeCount();
    
    OrgType getPlan();
    
    Long getEmployeeCount();
}