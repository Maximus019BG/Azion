package com.azion.Azion.Org.Controller;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Service.OrgService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/create")
    public ResponseEntity<?> createOrg() {

        String orgConnectString = "Test Connection String5";
        Optional<Org> existingOrg = orgRepository.findByOrgConnectString(orgConnectString);

        if (existingOrg.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An organization with the same connection string already exists.");
        }

        Org org = new Org();
        org.setOrgName("Test1 Organization");
        org.setOrgType("Test1 Type");
        org.setOrgAddress("Test1 Address");
        org.setOrgEmail("test2@test.com");
        org.setOrgConnectString(orgConnectString);
        org.setUsers(new HashSet<>());

        orgRepository.save(org);

        return ResponseEntity.ok(org);
    }
    @GetMapping("/addUser")
    public ResponseEntity<Org> addUserToOrg() {

        Org org = orgRepository.findById("Test Organization").orElse(null);
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
    @GetMapping("/remove/{email}")
    public ResponseEntity<?> removeUserFromOrg(@PathVariable String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        user.setOrgid(null);

        userRepository.save(user);

        return ResponseEntity.ok("User with email " + email + " removed.");
    }

    @GetMapping("/invite/{email}")
    public ResponseEntity<?> inviteUserToOrg(@PathVariable String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        user.setOrgid("4159ad423f834fbc9669f0968e24824d1715877611053");

        userRepository.save(user);

        return ResponseEntity.ok("User with email " + email + " invited.");
    }

    @GetMapping("/users")
    public ResponseEntity<Set<User>> getUsersOfOrg() {

        Org org = orgRepository.findById("Test Organization").orElse(null);
        Set<User> users = null;

        if (org != null) {
            users = orgService.getUsersOfOrg(org);
        }

        return ResponseEntity.ok(users);
    }
}