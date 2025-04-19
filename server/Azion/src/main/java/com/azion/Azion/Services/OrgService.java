package com.azion.Azion.Services;

import com.azion.Azion.Models.DTO.OrgDTO;
import com.azion.Azion.Models.DTO.RoleDTO;
import com.azion.Azion.Models.Org;
import com.azion.Azion.Models.Role;
import com.azion.Azion.Models.User;
import com.azion.Azion.Repositories.OrgRepository;
import com.azion.Azion.Repositories.RoleRepository;
import com.azion.Azion.Repositories.UserRepository;
import com.azion.Azion.Utils.OrgUtility;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class OrgService {
    
    private static final Logger log = LoggerFactory.getLogger(OrgService.class);
    
    //Email domains to exclude for same email invitation list
    private static final String[] exclEmailDomains = {
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "hotmail.com",
            "live.com",
            "icloud.com",
            "me.com",
            "mac.com",
            "protonmail.com",
            "zoho.com",
            "aol.com",
            "microsoft.com",
            "yandex.com",
            "mail.bg",
            "abv.bg",
            "gmx.com",
            "fastmail.com",
            "tutanota.com",
            "hushmail.com",
            "rediffmail.com",
            "dir.bg"
    };
    
    
    private final OrgRepository orgRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserService userService;
    private final RoleRepository roleRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Autowired
    private OrgService(OrgRepository orgRepository, UserRepository userRepository, EmailService emailService, UserService userService, RoleRepository roleRepository) {
        this.orgRepository = orgRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.userService = userService;
        this.roleRepository = roleRepository;
    }
    
    
    private RoleDTO convertToRoleDTO(Role role){
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setRoleAccess(role.getRoleAccess());
        roleDTO.setColor(role.getColor());
        return roleDTO;
    }
    
    public OrgDTO findOrgById(String orgId) {
        OrgDTO org = orgRepository.findOrgByOrgID(orgId).orElse(null);
        return org;
    }
    
    public void addUserToOrg(Org org, User user) {
        
        if (user.getOrgid() != null) {
            throw new RuntimeException("User is already in org");
        }
        
        user.setOrgid(org.getOrgID());
        Set<User> users = org.getUsers();
        user.setRole(defaultRole(org.getOrgID())); //Default role access
        userRepository.save(user);
        users.add(user);
        org.setUsers(users);
        orgRepository.save(org);
    }
    
    public Role defaultRole(String orgId) {
        return roleRepository.findByNameAndOrg("employee", orgId).orElse(null);
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
    
    public void removeEmployee(User user) {
        if (!userService.UserHasRight(user, "employees:read")) {
            throw new RuntimeException("");
        }
        Org org = orgRepository.findById(user.getOrgid()).orElse(null);
        Role role = user.getRole();
        List<User> employees = new ArrayList<>(org.getUsers());
        employees.remove(user);
        user.setOrgid(null);
        user.setRole(null);
        orgRepository.save(org);
        userRepository.save(user);
        List<User> usersList = role.getUsers().stream().toList();
        usersList.remove(user);
        role.setUsers(new HashSet<>(usersList));
    }
    
    public Set<RoleDTO> getOrgRoles(Org org) {
        Set<RoleDTO> roleLevels = new HashSet<>();
        Set<Role> roles = roleRepository.findByOrg(org);
        for (Role role : roles) {
            roleLevels.add(convertToRoleDTO(role));
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
    
    //!Owner remover blocker
    public void ensureOwnerHasLevelOne(String orgId) {
        Role role = ownerRole();
        role.setOrg(orgRepository.findById(orgId).get());
        
        if(roleRepository.findByNameAndOrg("owner", orgId).isEmpty()){
            roleRepository.save(role);
            //*Final hope
            User randomUser = userRepository.findByOrgid(orgId).get(0);
            randomUser.setRole(role);
            userRepository.save(randomUser);
        }
        else{
        }
        
    }
    
    public Set<User> getUsersOfOrg(Org org) {
        return org.getUsers();
    }
    
    //Create owner role
    public Role ownerRole() {
        Role role = new Role();
        role.setName("owner");
        role.setColor("#000000");
        role.setRoleAccess(userService.highestAccess());
        return role;
    }
    public void welcomeEmail(String to, String name, String orgName) {
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>" + orgName + " has been registered with this email</title>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                "        h1 { color: #333; }" +
                "        p { margin: 10px 0; }" +
                "        a { color: #1a73e8; text-decoration: none; }" +
                "        a:hover { text-decoration: underline; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <p>Dear " + name + ",</p>" +
                "    <p>We are thrilled to assist you in enhancing your organization's security and management. With Azion's platform, you can easily safeguard your data, streamline operations, and maintain control over your security infrastructure.</p>" +
                "    <p>Our platform is designed to provide advanced security solutions while giving you the tools to effectively manage your organization's needs. We hope you have a great experience using Azion!</p>" +
                "    <p>If you have any questions or need support, feel free to reach out to us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</p>" +
                "    <p>Thank you for choosing Azion for your security and management solutions!</p>" +
                "    <p>Best regards,</p>" +
                "    <p>The AzionOnline Team</p>" +
                "</body>" +
                "</html>";
        
        String subject = orgName + " is in Azion";
        
        try {
            emailService.sendEmail(to, subject, htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email");
        }
    }
    
    public List<String> listRoles(Org org) {
        List<String> roles = new ArrayList<>();
        Set<Role> roleSet = roleRepository.findByOrg(org);
        for (Role role : roleSet) {
            roles.add(role.getName());
        }
        return roles;
    }
    
    public Map<String, String> listPeople(Org org) {
        Map<String, String> people = new HashMap<>();
        //Get the org domain
        String email = org.getOrgEmail();
        //Check if org has domain
        boolean emailIsExcluded = false;
        for (String domain : exclEmailDomains) {
            if (email.contains(domain)) {
                emailIsExcluded = true;
                break;
            }
        }
        
        //Decide which users to take
        List<User> employees = new ArrayList<>();
        if (emailIsExcluded) {
            //Number of people
            int len = userRepository.findAll().size();
            int n;
            if (len > 5) {
                n = 5;
            } else {
                n = len;
            }
            for (int i = 0; i < n; i++) {
                employees.add(userRepository.findRandomUser().get(i));
            }
        } else {
            employees = userRepository.findByEmailDomain(email);
        }
        
        //Return email and id
        for (User user : employees) {
            if (user.getOrgid() == null) {
                people.put(user.getEmail(), user.getId());
            }
        }
        return people;
    }
    
    public void inviteEmail(String to, String name, String orgName, String link) {
        if (userRepository.findByEmail(to).getOrgid() != null) {
            throw new RuntimeException("User already in organization");
        }
        
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>" + "Invitation to join " + orgName + "</title>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                "        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }" +
                "        h1 { color: #333; font-size: 24px; margin-bottom: 20px; }" +
                "        p { color: #555; font-size: 16px; line-height: 1.6; }" +
                "        a { color: #1a73e8; text-decoration: none; font-weight: bold; }" +
                "        a:hover { text-decoration: underline; }" +
                "        .footer { margin-top: 20px; font-size: 14px; text-align: center; color: #777; }" +
                "        .footer a { color: #1a73e8; }" +
                "        .btn { display: inline-block; background-color: #1a73e8; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }" +
                "        .btn:hover { background-color: #155c9d; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class=\"container\">" +
                "        <h1>Invitation to Join " + orgName + "</h1>" +
                "        <p>Dear " + name + ",</p>" +
                "        <p>We are pleased to invite you to join <strong>" + orgName + "</strong> on the Azion platform.</p>" +
                "        <p>To accept this invitation, please click the button below:</p>" +
                "        <p><a href=\"" + link + "\" class=\"btn\">Join Now</a></p>" +
                "        <p>If you have any questions or need support, please feel free to reach out to us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</p>" +
                "        <p>Thank you for choosing Azion</p>" +
                "        <p>Best regards,</p>" +
                "        <p>The AzionOnline Team</p>" +
                "        <div class=\"footer\">" +
                "            <p>If you did not request this invitation, please ignore this email.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
        
        
        String subject = "Invitation to join " + orgName;
        
        try {
            emailService.sendEmail(to, subject, htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email");
        }
    }
    
}