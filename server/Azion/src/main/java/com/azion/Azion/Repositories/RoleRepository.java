package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends JpaRepository<Role, String> {
    
    @Query("SELECT r FROM Role r WHERE r.name = :roleName")
    Optional<Role> findByName(@Param("roleName") String roleName);
    
    @Query("SELECT r FROM Role r WHERE r.name = :roleName AND r.org.orgID = :orgId")
    Optional<Role> findByNameAndOrg(@Param("roleName") String roleName, @Param("orgId") String orgId);
    
    @Query("SELECT r FROM Role r WHERE r.org = :org")
    Set<Role> findByOrg(@Param("org") Org org);
}