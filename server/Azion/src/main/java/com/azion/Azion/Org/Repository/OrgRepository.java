package com.azion.Azion.Org.Repository;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Model.DTO.OrgDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrgRepository extends JpaRepository<Org, String> {
    Optional<Org> findOrgByOrgConnectString(String orgConnectString);
    Optional<Org> findOrgByOrgName(String orgName);
    Optional<Org> findOrgByOrgAddress(String orgAddress);
    Optional<OrgDTO>findByOrgAddress(String orgAddress);
 
    @Query("SELECT o FROM Org o")
    List<OrgDTO> findAllOrgs();
    
    
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Org o WHERE o.orgID = :orgID AND o.orgConnectString = :orgConnectString " +
            "AND o.orgName = :orgName AND o.orgAddress = :orgAddress AND o.orgEmail = :orgEmail AND o.orgEmail = :orgEmail")
    boolean existsOrg( String orgID,String orgName,String orgConnectString,  String orgAddress, String orgEmail);
}