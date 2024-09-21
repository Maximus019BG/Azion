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
        String resetLink="http://localhost:3000/reset-password?token="+resetToken;
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
                "    <p>Thank you,</p>" +
                "    <p>Your Company Team</p>" +
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
}
