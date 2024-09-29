package com.azion.Azion.Org.Service;

import com.azion.Azion.Org.Model.Org;
import com.azion.Azion.Org.Repository.OrgRepository;
import com.azion.Azion.Org.Util.OrgUtility;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrgService {
    
    private static final Logger log = LoggerFactory.getLogger(OrgService.class);
    private final OrgRepository orgRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    @PersistenceContext
    private EntityManager entityManager;
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Autowired
    private OrgService(OrgRepository orgRepository, UserRepository userRepository, JavaMailSender mailSender) {
        this.orgRepository = orgRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }
    
    // Send email
    public void sendEmail(String to, String subject, String content) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
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
            } else if (!boss.isEmpty()) {
                User bossUser = boss.get(0);
                bossUser.setRoleLevel(1);
                userRepository.save(bossUser);
            } else if (!admins.isEmpty()) {
                User admin = admins.get(0);
                admin.setRoleLevel(1);
                userRepository.save(admin);
            } else if (!employees.isEmpty()) {
                
                User employee = employees.get(0);
                employee.setRoleLevel(1);
                userRepository.save(employee);
            } else if (!noRoleUsers.isEmpty()) {
                User noRoleUser = noRoleUsers.get(0);
                noRoleUser.setRoleLevel(1);
                userRepository.save(noRoleUser);
            } else {
                User randomUser = userRepository.findByOrgid(orgId).get(0);
                randomUser.setRoleLevel(1);
                userRepository.save(randomUser);
            }
        }
    }
    
    public Set<User> getUsersOfOrg(Org org) {
        return org.getUsers();
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
                "    <p>The Azion Team</p>" +
                "</body>" +
                "</html>";
        
        String subject = orgName + " is in Azion";
        
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (
                MessagingException e) {
            e.printStackTrace();
        }
    }
}

