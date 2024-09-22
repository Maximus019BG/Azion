package com.azion.Azion.Org.Service;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.*;
import com.azion.Azion.Org.Repository.OrgRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrgService {
    
    private static final Logger log = LoggerFactory.getLogger(OrgService.class);
    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private OrgRepository orgRepository;
    @Autowired
    private UserRepository userRepository;
    
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
    
    public Map<String, Integer> getOrgRoles(Org org) {
        List<User> users = org.getUsers().stream().collect(Collectors.toList());
        Map<String, Integer> roleLevels = new HashMap<>();
        for (User user : users) {
            if (user.getRole() != null && !user.getRole().equals("none")
                    && user.getRoleLevel() != null && user.getRoleLevel() != 0) {
                roleLevels.put(user.getRole(), user.getRoleLevel());
            }
        }
        return roleLevels;
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
    
    public void ensureOwnerHasLevelOne(String orgId) {
        List<User> usersWithLevelOne = userRepository.findByRoleLevelAndOrgid(1, orgId);
        if (usersWithLevelOne.isEmpty()) {
            List<User> owners = userRepository.findByRoleAndOrgid("owner", orgId);
            List<User> boss = userRepository.findByRoleAndOrgid("boss", orgId);
            List<User> admins = userRepository.findByRoleAndOrgid("admin", orgId);
            List<User> employees = userRepository.findByRoleAndOrgid("employee", orgId);
            List<User> noRoleUsers = userRepository.findByRoleAndOrgid("none", orgId);
            if (!owners.isEmpty()) {
                User owner = owners.get(0);
                owner.setRoleLevel(1);
                userRepository.save(owner);
            }
            else if(!boss.isEmpty()) {
                User bossUser = boss.get(0);
                bossUser.setRoleLevel(1);
                userRepository.save(bossUser);
            }
            else if (!admins.isEmpty()) {
                User admin = admins.get(0);
                admin.setRoleLevel(1);
                userRepository.save(admin);
            }
            else if(!employees.isEmpty()) {
           
                User employee = employees.get(0);
                employee.setRoleLevel(1);
                userRepository.save(employee);
            }
            else if (!noRoleUsers.isEmpty()) {
                User noRoleUser = noRoleUsers.get(0);
                noRoleUser.setRoleLevel(1);
                userRepository.save(noRoleUser);
            }
            else{
                User randomUser = userRepository.findByOrgid(orgId).get(0);
                randomUser.setRoleLevel(1);
                userRepository.save(randomUser);
            }
        }
    }
    public Set<User> getUsersOfOrg(Org org) {
        return org.getUsers();
    }
}