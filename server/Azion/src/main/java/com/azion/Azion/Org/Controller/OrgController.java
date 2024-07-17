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

import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;


@RestController
@RequestMapping("/api/org")
public class OrgController {
    
    private final OrgService orgService;
    private final OrgRepository orgRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    
    //Constructor
    @Autowired
    public OrgController(OrgService orgService, OrgRepository orgRepository, UserService userService, UserRepository userRepository) {
        this.orgService = orgService;
        this.orgRepository = orgRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }
    
    //Creates an organization
    @GetMapping("/create")
    public ResponseEntity<?> createOrg() {

        String orgConnectString = "Test Connection String5";
        Optional<Org> existingOrg = orgRepository.findOrgByOrgConnectString(orgConnectString);

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
    
    //Show all organizations
    @GetMapping("/list/all")
    public ResponseEntity<?> listOrgs() {
        return ResponseEntity.ok(orgRepository.findAll());
    }
    
    //Creates a boss and organization
    @GetMapping("/boss/{email}")
    public ResponseEntity<?> createBoss(@PathVariable String email) {

        Org org = new Org();
        org.setOrgName("Test Organization1");
        org.setOrgEmail(email);
        org.setOrgAddress("Test Address1");
        org.setOrgType("Test Type1");
        org.setOrgConnectString("Test Connection String1");
        
        orgService.createOrg(org);
        Date date = new Date();
        User user = new User();
        user.setName("Boss Name");
        user.setAge(date);
        user.setEmail(email);
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFace");
        user.setRole("Boss");
        user.setOrgid(org.getOrgID());
        
//        userService.createUser(user);
        
        /*
        *TODO: Decide: user or org????!!!??!?!?!?!?
        *TODO: Decide: user or org????!!!??!?!?!?!?
        *TODO: Decide: user or org????!!!??!?!?!?!?
        */
        return ResponseEntity.ok(user);
    }
    
    //!IMPORTANT:CREATES and ADDS user to the organization
    @GetMapping("/create/employee/account/{email}")
    public ResponseEntity<Org> addUserToOrg(@PathVariable String email) {
        Date date = new Date();
        Org org = orgRepository.findOrgByOrgName("Test Organization").orElse(null);
        User user = new User();
        user.setName("Hardcoded Name");
        user.setAge(date);
        user.setEmail(email);
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFaceID");
        user.setRole("hardcodedRole");
        user.setOrgid("ce77d1227d6c43e5a72457de785e4a9b1715804886698");

//        userService.createUser(user);

        if (org != null) {
            orgService.addUserToOrg(org, user);
        }

        return ResponseEntity.ok(org);
    }

    //Removes user
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
    
    //Invites user
    @GetMapping("/invite/{email}")
    public ResponseEntity<?> inviteUserToOrg(@PathVariable String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        user.setOrgid("ce77d1227d6c43e5a72457de785e4a9b1715804886698");

        userRepository.save(user);

        return ResponseEntity.ok("User with email " + email + " invited.");
    }
    
    //Listing employees
    @GetMapping("/list/employees")
    public ResponseEntity<?> listEmployees() {

        Org org = orgRepository.findById("ce77d1227d6c43e5a72457de785e4a9b1715804886698").orElse(null);

        if(org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Set<User> users = org.getUsers();
        
        return ResponseEntity.ok(users);
    }

    @GetMapping("/delete/org/{orgName}")
    public ResponseEntity<?> deleteOrg(@PathVariable String orgName) {

        Org org = orgRepository.findById(orgName).orElse(null);

        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }

        orgRepository.delete(org);

        return ResponseEntity.ok("Organization with id " + orgName + " deleted.");
    }
}