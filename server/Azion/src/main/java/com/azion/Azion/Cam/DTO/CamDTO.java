package com.azion.Azion.Cam.DTO;

import com.azion.Azion.User.Model.DTO.RoleDTO;
import com.azion.Azion.User.Model.Role;

public class CamDTO {
    private String id;
    private String orgAddress;
    private String camName;
    private RoleDTO role;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrgAddress() {
        return orgAddress;
    }

    public void setOrgAddress(String orgAddress) {
        this.orgAddress = orgAddress;
    }

    public String getCamName() {
        return camName;
    }

    public void setCamName(String camName) {
        this.camName = camName;
    }

    public RoleDTO getRole() {
        return role;
    }

    public void setRole(RoleDTO role) {
        this.role = role;
    }
}