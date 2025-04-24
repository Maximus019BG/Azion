package com.azion.Azion.Models.DTO;

public class RoleDTO {
    private String id;
    private String name;
    private String roleAccess;
    private String color;
    

    public String getRoleAccess() {
        return roleAccess;
    }

    ///<summary>
    /// IN ORDER:
    ///
    /// Calendar                calendar:write
    ///
    /// Settings                settings:write  settings:read
    ///
    /// Employees               employees:read
    ///
    /// Roles                   roles:write     roles:read
    /// Create Tasks            tasks:write
    ///
    /// View Tasks              tasks:read
    ///
    /// Azion Cameras (Write)   cameras:write
    ///

    public void setRoleAccess(String roleAccess) {
        this.roleAccess = roleAccess;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

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
}
