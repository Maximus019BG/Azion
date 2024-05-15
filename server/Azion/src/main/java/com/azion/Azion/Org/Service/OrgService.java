package com.azion.Azion.Org.Service;

import com.azion.Azion.Org.Model.OrgModel;
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

    public void addUserToOrg(OrgModel org, User user) {
        user.setOrgid(org.getOrgID()); // Set the orgID field of the User
        Set<User> users = org.getUsers();
        users.add(user);
        org.setUsers(users);
        orgRepository.save(org);
    }

    public void removeUserFromOrg(OrgModel org, User user) {
        Set<User> users = org.getUsers();
        users.remove(user);
        org.setUsers(users);
        orgRepository.save(org);
    }

    public Set<User> getUsersOfOrg(OrgModel org) {
        return org.getUsers();
    }
}