package com.azion.Azion.Controllers;

import com.azion.Azion.Enums.OrgType;
import com.azion.Azion.Models.DTO.OrgDTO;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.DTO.TasksDTO;
import com.azion.Azion.Models.DTO.UserDTO;
import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.Task;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Repositories.RoleRepository;
import com.azion.Azion.Repositories.UserRepository;
import com.azion.Azion.Services.OrgService;
import com.azion.Azion.Services.TokenService;
import com.azion.Azion.Services.UserService;
import com.azion.Azion.Utils.OrgUtility;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/org")
public class OrgController {
    
    private final OrgService orgService;
    private final OrgRepository orgRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final RoleRepository roleRepository;
    
    @Autowired
    public OrgController(OrgService orgService, OrgRepository orgRepository, UserService userService, UserRepository userRepository, TokenService tokenService, RoleRepository roleRepository) {
        this.orgService = orgService;
        this.orgRepository = orgRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.roleRepository = roleRepository;
    }
    
    
    private RoleDTO convertToRoleDTO(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
    }
    
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<?> createOrg(@RequestBody Map<String, Object> request) throws Exception {
        String orgName = (String) request.get("orgName");
        String orgType = (String) request.get("orgType");
        String orgAddress = (String) request.get("orgAddress");
        String orgEmail = (String) request.get("orgEmail");
        String orgPhone = (String) request.get("orgPhone");
        String orgDescription = (String) request.get("orgDescription");
        String accessToken = (String) request.get("accessToken");
        
        Optional<Org> existingOrg = orgRepository.findOrgByOrgAddress(orgAddress);
        
        if (existingOrg.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An organization with the same address already exists.");
        }
        
        Org org = new Org();
        org.setOrgName(orgName);
        org.setOrgType(orgType);
        org.setOrgAddress(orgAddress);
        org.setOrgEmail(orgEmail);
        org.setOrgPhone(orgPhone);
        org.setOrgDescription(orgDescription);
        org.setEmployeeCount(1L);
        org.setMaxEmployeeCount(5L);
        org.setPlan(OrgType.FREE);
        org.setCustomerID(null);
        org.setUsers(new HashSet<>());
        orgRepository.save(org);
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Role defaultRole = new Role();
        defaultRole.setName("employee");
        defaultRole.setRoleAccess("tasks:read, ");
        defaultRole.setOrg(org);
        defaultRole.setColor("#0000ff");
        roleRepository.save(defaultRole);
        
        
        Role role = new Role();
        role.setName("owner");
        role.setRoleAccess(userService.highestAccess());
        Set<User> users = new HashSet<>();
        users.add(user);
        role.setUsers(users);
        role.setOrg(org);
        role.setColor("#0000ff");
        roleRepository.save(role);
        
        
        //Update user
        orgService.addUserToOrg(org, user);
        user.setRole(role);
        userRepository.save(user);
        orgService.welcomeEmail(user.getEmail(), user.getName(), org.getOrgName());
        
        String encryptedString = org.getOrgConnectString();
        String conSring = OrgUtility.decrypt(encryptedString);
        
        return ResponseEntity.ok(conSring);
    }
    
    @PostMapping("/join")
    @Transactional
    public ResponseEntity<?> checkConnectString(@RequestBody Map<String, Object> request) {
        String connectionString = (String) request.get("connString");
        String accessToken = (String) request.get("accessToken");
        Org org = orgService.findOrgByConnectString(connectionString);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found");
        }
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        } else if (user.getOrgid() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already part of an organization.");
        }
        if (org.getEmployeeCount() != null && org.getMaxEmployeeCount() != null
                && org.getEmployeeCount().longValue() == org.getMaxEmployeeCount().longValue()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Max employee count reached");
        }
        orgService.addUserToOrg(org, user);
        return ResponseEntity.ok("User added to organization.");
    }
    
    @GetMapping("/get/{orgId}")
    public ResponseEntity<?> getOrg(@PathVariable String orgId) {
        OrgDTO org = orgService.findOrgById(orgId);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Org not found.");
        }
        
        return ResponseEntity.ok(org);
    }
    
    @Transactional
    @PutMapping("/con/str/{conStr}")
    public ResponseEntity<?> addUserToOrg(@PathVariable String conStr, @RequestBody Map<String, Object> request) {
        String accessToken = (String) request.get("accessToken");
        String refreshToken = (String) request.get("refreshToken");
        //Token validation
        if (!tokenService.validateToken(accessToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token.");
        }
        tokenService.sessionCheck(refreshToken, accessToken);
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgService.findOrgByConnectString(conStr);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid link");
        }
        orgService.addUserToOrg(org, user);
        return ResponseEntity.ok("User added to organization.");
    }
    
    @Transactional
    @GetMapping("/get/invites")
    public ResponseEntity<?> getInvites(@RequestHeader Map<String, String> headers) {
        String accessToken = headers.get("authorization");
        User user = tokenService.getUserFromToken(accessToken);
        //Validation
        if (!tokenService.validateToken(accessToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access token.");
        } else if (!userService.UserHasRight(user, "settings:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Access denied.");
        }
        Org org = orgService.findOrgByUser(user);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        Map<String, String> result = new HashMap<>();
        result = orgService.listPeople(org); //Display related people
        return ResponseEntity.ok(result);
    }
    
    @Transactional
    @GetMapping("/conn/{AccessToken}")
    public ResponseEntity<?> connStringShow(@PathVariable String AccessToken) {
        User user = tokenService.getUserFromToken(AccessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        String encryptedString = org.getOrgConnectString();
        String conSring = OrgUtility.decrypt(encryptedString);
        return ResponseEntity.ok(conSring);
    }
    
    @Transactional
    @GetMapping("/{AccessToken}")
    public ResponseEntity<?> orgData(@PathVariable String AccessToken) {
        User user = tokenService.getUserFromToken(AccessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Optional<OrgDTO> orgDTO = orgRepository.findByOrgAddress(org.getOrgAddress());
        
        return ResponseEntity.ok(orgDTO);
    }
    
    @Transactional
    @PutMapping("/update/{accessToken}")
    public ResponseEntity<?> updateOrg(@RequestBody Map<String, Object> request, @PathVariable String accessToken) {
        String orgName = (String) request.get("orgName");
        String orgType = (String) request.get("orgType");
        String orgAddress = (String) request.get("orgAddress");
        String orgEmail = (String) request.get("orgEmail");
        String orgPhone = (String) request.get("orgPhone");
        String orgDescription = (String) request.get("orgDescription");
        
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (orgName.contains(" ")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Name can't have spaces");
        }
        if (!userService.UserHasRight(user, "settings:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not admin");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        
        org.setOrgName(orgName);
        org.setOrgType(orgType);
        org.setOrgAddress(orgAddress);
        org.setOrgEmail(orgEmail);
        org.setOrgPhone(orgPhone);
        org.setOrgDescription(orgDescription);
        orgRepository.save(org);
        
        return ResponseEntity.ok("Organization updated.");
    }
    
    @Transactional
    @PostMapping("/partOfOrg")
    public ResponseEntity<?> getOrg(@RequestBody Map<String, Object> request) {
        String token = (String) request.get("accessToken");
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token not found.");
        }
        User user = tokenService.getUserFromToken(token);
        if (user == null) {
            log.debug("User not found for token: " + token);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (user.getOrgid() == null) {
            log.debug("Organization not found for user: " + user.getId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Optional<OrgDTO> orgDTO = orgRepository.findByOrgAddress(org.getOrgAddress());
        
        
        return ResponseEntity.ok(orgDTO);
    }
    
    @Transactional
    @GetMapping("/list/all")
    public ResponseEntity<?> listOrgs() {
        List<OrgDTO> orgs = orgRepository.findAllOrgs();
        return ResponseEntity.ok(orgs);
    }
    
    @Transactional
    @GetMapping("/list/employees")
    public ResponseEntity<?> listEmployees(@RequestHeader("authorization") String token) {
        try {
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Authorization token not found.");
            }
            
            User user = tokenService.getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
            
            Org org = orgRepository.findById(user.getOrgid()).orElse(null);
            if (org == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
            }
            Hibernate.initialize(org.getUsers());
            org.getUsers().forEach(u -> {
                Hibernate.initialize(u.getTasks());
                u.getTasks().forEach(project -> Hibernate.initialize(project.getUsers()));
            });
            
            Set<UserDTO> userDTOs = org.getUsers().stream()
                    .map(this::convertToUserData)
                    .collect(Collectors.toSet());
            
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
    
    private UserDTO convertToUserData(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setAge(user.getAge().toString());
        userDTO.setRole(convertToRoleDTO(user.getRole()));
        userDTO.setOrgid(user.getOrgid());
        userDTO.setProfilePicture(Arrays.toString(user.getProfilePicture()));
        
        Hibernate.initialize(user.getTasks());
        Set<Task> projects = user.getTasks();
        Set<TasksDTO> projectDTOs = userService.convertProjectsToDTO(projects);
        userDTO.setProjects(projectDTOs);
        
        return userDTO;
    }
    
    
    @Transactional
    @GetMapping("/remove/{email}")
    public ResponseEntity<?> removeUserFromOrg(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        if (Objects.equals(user.getRole().getName(), "owner")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Can not remove owner");
        }
        Role role = user.getRole();
        role.setUsers(role.getUsers().stream().filter(u -> !u.getId().equals(user.getId())).collect(Collectors.toSet()));
        roleRepository.save(role);
        
        user.setOrgid(null);
        user.setRole(null);
        userRepository.save(user);
        
        return ResponseEntity.ok("User with email " + email + " removed.");
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
    
    @Transactional
    @GetMapping("/list/roles/{accessToken}")
    public ResponseEntity<?> listRoles(@PathVariable String accessToken) {
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        Set<RoleDTO> roles = orgService.getOrgRoles(org);
        return ResponseEntity.ok(roles);
    }
    
    
    @Transactional
    @DeleteMapping("/remove/employee/{id}")
    public ResponseEntity<?> removeEmployee(@PathVariable String id, @RequestHeader("authorization") String accessToken) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        if (!userService.UserHasRight(user, "employees:read")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User doesn't have rights to do that");
        }
        User employee = userRepository.findById(id).orElse(null);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found.");
        }
        
        if (employee.getRole().getName().trim().equals("owner")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Can not remove owner");
        }
        
        orgService.removeEmployee(employee);
        return ResponseEntity.ok("Employee removed.");
    }
    
    @Transactional
    @PutMapping("/invite/{id}")
    public ResponseEntity<?> invite(@PathVariable String id, @RequestHeader("authorization") String accessToken, @RequestHeader("data") String link) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        
        if (!userService.UserHasRight(user, "settings:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User doesn't have rights to do that");
        }
        User employee = userRepository.findById(id).orElse(null);
        
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found.");
        }
        
        orgService.inviteEmail(employee.getEmail(), employee.getName(), orgService.findOrgByUser(user).getOrgName(), link);
        
        return ResponseEntity.ok("User added");
    }
    
    @Transactional
    @GetMapping("/role/access/{roleName}")
    public ResponseEntity<?> getRoleAccess(@PathVariable String roleName, @RequestHeader("authorization") String accessToken) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        if (!userService.UserHasRight(user, "roles:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User doesn't have rights to do that");
        }
        if (Objects.equals(roleName, "owner")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User doesn't have rights to do that");
        }
        
        return ResponseEntity.ok(userService.getAccessByRoleName(roleName, user.getOrgid()));
    }
    
    //Update role access
    @Transactional
    @PutMapping("/role/update/{roleName}")
    public ResponseEntity<?> roleAccessUpdate(@PathVariable String roleName, @RequestHeader("authorization") String accessToken, @RequestBody Map<Object, String> request) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        if (!userService.UserHasRight(user, "roles:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User doesn't have rights to do that");
        }
        if (Objects.equals(roleName, "owner")) {
            userService.updateRoleAccess(request.get("color"), roleName, userService.highestAccess(), user.getOrgid());
            return ResponseEntity.status(HttpStatus.OK).body("User doesn't have rights to do that");
        }
        if (request.get("accessFields") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Access fields is required");
        }
        
        userService.updateRoleAccess(request.get("color"), roleName, request.get("accessFields"), user.getOrgid());
        return ResponseEntity.ok("Access granted");
    }
    
    @Transactional
    @GetMapping("/get/role/{roleName}")
    public ResponseEntity<?> getRoleByName(@PathVariable String roleName, @RequestHeader("authorization") String accessToken) {
        userService.userValid(accessToken);
        User user = tokenService.getUserFromToken(accessToken);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        Role role = roleRepository.findByNameAndOrg(roleName, user.getOrgid()).orElse(null);
        
        if (role == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Role not found");
        }
        return ResponseEntity.ok(convertToRoleDTO(role));
    }
    
    //Update roles and users
    @Transactional
    @PutMapping("/update/roles/{accessToken}")
    public ResponseEntity<?> updateRolesAndUsers(@RequestBody Map<String, Object> request, @PathVariable String accessToken) {
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        if (!userService.UserHasRight(user, "roles:write")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User does not have permission to update roles.");
        }
        
        List<Map<String, Object>> rolesData = (List<Map<String, Object>>) request.get("roles");
        List<Map<String, Object>> usersData = (List<Map<String, Object>>) request.get("users");
        
        Map<String, Role> savedRoles = new HashMap<>();
        
        for (Map<String, Object> roleData : rolesData) {
            String roleId = (String) roleData.get("id");
            String roleName = (String) roleData.get("name");
            String roleAccess = (String) roleData.get("roleAccess");
            String roleColor = (String) roleData.get("color");
            
            Role role;
            if (roleId == null) {
                role = new Role();
                role.setOrg(orgRepository.findById(user.getOrgid()).orElse(null));
                role.setName(roleName);
                role.setRoleAccess(roleAccess);
                role.setColor(roleColor);
                roleRepository.save(role);
                savedRoles.put(role.getId(), role);
            } else {
                role = roleRepository.findById(roleId).orElse(new Role());
                role.setName(roleName);
                role.setRoleAccess(roleAccess);
                role.setColor(roleColor);
                roleRepository.save(role);
                savedRoles.put(role.getId(), role);
            }
        }
        
        for (Map<String, Object> userData : usersData) {
            String userId = (String) userData.get("id");
            String userEmail = (String) userData.get("email");
            Object roleData = userData.get("role");
            
            User userToUpdate = userRepository.findById(userId).orElse(null);
            if (userToUpdate == null) {
                continue;
            }
            
            if (roleData instanceof Map) {
                Map<String, Object> roleMap = (Map<String, Object>) roleData;
                String roleId = (String) roleMap.get("id");
                Role role = savedRoles.get(roleId);
                if (role != null) {
                    userToUpdate.setRole(role);
                }
            } else if (roleData instanceof String roleName) {
                Role role = roleRepository.findByName(roleName).orElse(null);
                if (role != null) {
                    userToUpdate.setRole(role);
                }
            }
            
            userRepository.save(userToUpdate);
        }
        
        orgService.ensureOwnerHasLevelOne(user.getOrgid());
        
        return ResponseEntity.ok("Roles and users updated successfully.");
    }
    
    @Transactional
    @GetMapping("/get/plan")
    public ResponseEntity<?> getOrgPlan(@RequestHeader("authorization") String accessToken) {
        User user = tokenService.getUserFromToken(accessToken);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        if (org == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Organization not found.");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("plan", org.getPlan().toString());
        response.put("maxEmployeeCount", org.getMaxEmployeeCount());
        
        return ResponseEntity.ok(response);
    }
}