package com.azion.Azion.Services;

import com.azion.Azion.Models.Org;
import com.azion.Azion.Repositories.OrgRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {
    
    private final OrgRepository orgRepository;
    
    @Autowired
    public EmailService(OrgRepository orgRepository) {
        this.orgRepository = orgRepository;
    }

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    public void sendEmail(String to, String subject, String body) throws IOException {
        Email from = new Email(System.getProperty("spring.mail.username"));
        Email toEmail = new Email(to);
        Content content = new Content("text/html", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
        } catch (IOException ex) {
            throw ex;
        }
    }

    // Email to reset the password
    public void sendResetPasswordEmail(String to, String resetToken) throws IOException {
        String resetLink = "https://azion.online/reset-password?token=" + resetToken;
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
                "    <p>AzionOnline Team</p>" +
                "</body>" +
                "</html>";
        String subject = "Reset Your Password";
        sendEmail(to, subject, htmlContent);
    }

    public void sendLoginEmail(String to, String login, String name) {
        String link = "https://azion.online/account";
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
                "    <li>If you have any questions or need assistance, please don't hesitate to contact us at <a href=\"mailto:aziononlineteam@gmail.com\">aziononlineteam@gmail.com</a>.</li>" +
                "    <p>Thank you,</p>" +
                "    <p>AzionOnline Team</p>" +
                "</body>" +
                "</html>";
        String subject = "New device has logged in your account";

        try {
            sendEmail(to, subject, htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send login email");
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
                "    <p>The AzionOnline Team</p>" +
                "</body>" +
                "</html>";


        String subject = "Welcome to Azion";

        try {
            sendEmail(to, subject, htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email");
        }
    }
    
    public void camErrorEmail(String orgAddres, String camId){
        Org org = orgRepository.findOrgByOrgAddress(orgAddres).get();
        String to = org.getOrgEmail();
        
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <title>Welcome to Azion</title>" +
                "</head>" +
                "<body>" +
                "    <h1></h1>" +
                "    <p>Cam " + camId + " is not working properly</p>" +
                "    <p> If this issue continues contact Azion support or admin" +
                "</body>" +
                "</html>";
        try {
            sendEmail(to, "Camera " + camId +" not working properly", htmlContent);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email");
        }
        
    }
    //TODO: welcome to work email for cam
}