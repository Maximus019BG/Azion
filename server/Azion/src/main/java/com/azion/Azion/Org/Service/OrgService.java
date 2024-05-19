package com.azion.Azion.Org.Service;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.User.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.*;
import com.azion.Azion.Org.Repository.OrgRepository;
import java.util.Set;

@Service
public class OrgService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private OrgRepository orgRepository;
    
    
    //Add user to organization
    public void addUserToOrg(Org org, User user) {
        user.setOrgid(org.getOrgID());
        Set<User> users = org.getUsers();
        users.add(user);
        org.setUsers(users);
        orgRepository.save(org);
    }
    
    
    //Saves organization
    public Org createOrg(Org org) {
        //Check for existing organization
        if(orgRepository.existsOrg(org.getOrgID(), org.getOrgName(), org.getOrgConnectString(), org.getOrgAddress(), org.getOrgEmail())) {
            throw new IllegalArgumentException("Organization with this credentials already exists.");
        }
        
        return orgRepository.save(org);
        
    }
    
    //Get user from organization
    public Set<User> getUsersOfOrg(Org org) {
        return org.getUsers();
    }
}