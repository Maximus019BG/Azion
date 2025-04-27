package com.azion.Azion.Models.DTO;

import com.azion.Azion.Models.Network;

public class NetworkDTO {
    private String id;
    private String name;
    private String description;
    private String siteId;
    private String hostId;
    private OrgDTOImpl org;
    
    public static NetworkDTO fromNetwork(Network network) throws Exception {
        NetworkDTO dto = new NetworkDTO();
        dto.setId(network.getId());
        dto.setName(network.getName());
        dto.setDescription(network.getDescription());
        dto.setSiteId(network.getSiteId());
        dto.setHostId(network.getHostId());
        
        if (network.getOrg() != null) {
            OrgDTOImpl orgDTO = new OrgDTOImpl();
            orgDTO.setOrgID(network.getOrg().getOrgID());
            orgDTO.setOrgName(network.getOrg().getOrgName());
            orgDTO.setOrgType(network.getOrg().getOrgType());
            orgDTO.setOrgAddress(network.getOrg().getOrgAddress());
            orgDTO.setOrgEmail(network.getOrg().getOrgEmail());
            orgDTO.setOrgPhone(network.getOrg().getOrgPhone());
            orgDTO.setOrgDescription(network.getOrg().getOrgDescription());
            orgDTO.setSubscriptionID(network.getOrg().getSubscriptionID());
            orgDTO.setMaxEmployeeCount(network.getOrg().getMaxEmployeeCount());
            orgDTO.setPlan(network.getOrg().getPlan());
            orgDTO.setCustomerID(network.getOrg().getCustomerID());
            orgDTO.setEmployeeCount(network.getOrg().getEmployeeCount());
            dto.setOrg(orgDTO);
        }
        
        return dto;
    }
    
    // Getters and Setters
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSiteId() {
        return siteId;
    }
    
    public void setSiteId(String siteId) {
        this.siteId = siteId;
    }
    
    public String getHostId() {
        return hostId;
    }
    
    public void setHostId(String hostId) {
        this.hostId = hostId;
    }
    
    public OrgDTOImpl getOrg() {
        return org;
    }
    
    public void setOrg(OrgDTOImpl org) {
        this.org = org;
    }
}