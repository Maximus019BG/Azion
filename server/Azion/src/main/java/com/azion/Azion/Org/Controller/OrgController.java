package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.OrgModel;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/org")
public class OrgController {

    @Autowired
    private OrgService orgService;

    @Autowired
    private OrgRepository orgRepository;
    @Autowired
    private UserService userService;

    @GetMapping("/create")
public ResponseEntity<?> createOrg() {
    String orgConnectString = "Test Connection String";
    Optional<OrgModel> existingOrg = orgRepository.findByOrgConnectString(orgConnectString);
    if (existingOrg.isPresent()) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("An organization with the same connection string already exists.");
    }
    OrgModel org = new OrgModel();
    org.setOrgName("Test Organization");
    org.setOrgType("Test Type");
    org.setOrgAddress("Test Address");
    org.setOrgEmail("test@test.com");
    org.setOrgConnectString(orgConnectString);
    org.setUsers(new HashSet<>());
    orgRepository.save(org);
    return ResponseEntity.ok(org);
}
    @GetMapping("/addUser")
    public ResponseEntity<OrgModel> addUserToOrg() {
        OrgModel org = orgRepository.findById("Test Organization").orElse(null);
        User user = new User();
        user.setName("Hardcoded Name");
        user.setAge(30);
        user.setEmail("hardcoded@mail.com");
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFaceID");
        user.setRole("hardcodedRole");
        user.setOrgid("ce77d1227d6c43e5a72457de785e4a9b1715804886698");
        userService.createUser(user);
        if (org != null) {
            orgService.addUserToOrg(org, user);
        }
        return ResponseEntity.ok(org);
    }


    @GetMapping("/users")
    public ResponseEntity<Set<User>> getUsersOfOrg() {
        OrgModel org = orgRepository.findById("Test Organization").orElse(null);
        Set<User> users = null;
        if (org != null) {
            users = orgService.getUsersOfOrg(org);
        }
        return ResponseEntity.ok(users);
    }
}