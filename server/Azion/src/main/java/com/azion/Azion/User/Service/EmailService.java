package com.azion.Azion.User.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
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
    
    // Email to reset the password
    public void sendResetPasswordEmail(String to, String resetToken) {
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>Reset Password</title>" +
                "</head>" +
                "<body>" +
                "    <h1>Reset Your Password</h1>" +
                "    <p>Dear " + to + ",</p>" +
                "    <p>We received a request to reset your password. Click the link below to reset it:</p>" +
                "    <a href=\"" + resetLink + "\">Reset Password</a>" +
                "    <p>If you did not request a password reset, please ignore this email.</p>" +
                "    <p>If you need assistance, please contact us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</p>" +
                "    <p>Thank you,</p>" +
                "    <p>Azion Team</p>" +
                "</body>" +
                "</html>";
        String subject = "Reset Your Password";
        
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
    public void sendLoginEmail(String to, String login, String name) {
        String link = "http://localhost:3000/account";
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>New login</title>" +
                "</head>" +
                "<body>" +
                "    <h1 style=\" line-height: 1.5; font-weight: bold;\">New device has logged in your account using " + login + " </h1>" +
                "    <p>Dear " + name + ",</p>" +
                "   <p>A new device has logged into your account. If:</p>" +
                "<ul>\n" +
                "    <li>You recognize this device, no further action is required.</li>\n" +
                "    <li>You do not recognize this device, please secure your account immediately by going to <a href=\"" + link + "\">Account</a>.</li>\n" +
                "    <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</p>" +
                "    <p>Thank you,</p>" +
                "    <p>Azion Team</p>" +
                "</body>" +
                "</html>";
        String subject = "New device has logged in your account";
        
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
    public void welcomeEmail(String to, String name) {
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>Welcome to Azion</title>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; }" +
                "        h1 { color: #333; }" +
                "        p { margin: 10px 0; }" +
                "        a { color: #1a73e8; text-decoration: none; }" +
                "        a:hover { text-decoration: underline; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <h1>Welcome to Azion!</h1>" +
                "    <p>Dear " + name + ",</p>" +
                "    <p>We are thrilled to have you join our community!</p>" +
                "    <p>With Azion, you can easily manage your tasks, projects, and deadlines. We hope you enjoy using our platform!</p>" +
                "    <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</p>" +
                "    <p>Thank you for choosing Azion!</p>" +
                "    <p>Best regards,</p>" +
                "    <p>The Azion Team</p>" +
                "</body>" +
                "</html>";
        
        
        String subject = "Welcome to Azion";
        
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
