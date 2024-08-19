package com.azion.Azion.Org.Service;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.User.Model.User;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.*;
import com.azion.Azion.Org.Repository.OrgRepository;

import java.util.List;
import java.util.Set;

@Service
public class OrgService {

    private static final Logger log = LoggerFactory.getLogger(OrgService.class);
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private OrgRepository orgRepository;

    public void addUserToOrg(Org org, User user) {
        user.setOrgid(org.getOrgID());
        Set<User> users = org.getUsers();
        users.add(user);
        org.setUsers(users);
        orgRepository.save(org);
    }

    public Org findOrgByConnectString(String connectString) {
        List<Org> orgs = orgRepository.findAll();
        for (Org org : orgs) {
            String decryptedConnectString;
            try {
                decryptedConnectString = OrgUtility.decrypt(org.getOrgConnectString());
            } catch (IllegalArgumentException e) {
                log.error("Invalid Base64 encoding for orgConnectString: " + org.getOrgConnectString(), e);
                continue;
            }
            if (connectString.equals(decryptedConnectString)) {
                return org;
            }
        }
        return null;
    }
    
    public Org findOrgByUser(User user) {
        String jpql = "SELECT o FROM Org o JOIN o.users u WHERE u.id = :userId";
        List<Org> results = entityManager.createQuery(jpql, Org.class)
            .setParameter("userId", user.getId())
            .getResultList();
        if (results.isEmpty()) {
            return null;
        }
        return results.get(0);
    }

    public Set<User> getUsersOfOrg(Org org) {
        return org.getUsers();
    }
}