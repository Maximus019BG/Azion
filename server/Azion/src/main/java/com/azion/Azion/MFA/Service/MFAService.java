package com.azion.Azion.MFA.Service;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Util.UserUtility;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.apache.bcel.classfile.Code;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MFAService {
    private final UserRepository userRepository;
    
    @Autowired
    public MFAService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    
    public String generateQRCodeImage(String secret, String email) {
        User user = userRepository.findByEmail(email);
        String name = user.getName();
        
        String issuer = System.getenv("issuerName");
        QrData data = new QrData.Builder()
                .label("Azion: "+ name + "/" + email)
                .secret(secret)
                .issuer(issuer)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        QrGenerator generator = new ZxingPngQrGenerator();
        byte[] imageData = new byte[0];

        try {
            imageData = generator.generate(data);
        } catch (Exception e) {
            log.error("Error with generating QR code: ", e);
        }
        return Utils.getDataUriForImage(imageData, generator.getImageMimeType());
    }
    
    public boolean validateOtp(String secret, String otp) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        return verifier.isValidCode(secret, otp);
    }

    
    public String generateQRCodeUriForCurrentUser(String email) {
        String secret = getUserMFASecret(email);
        
        return generateQRCodeImage(secret, email);
    }
    
    private String getUserMFASecret(String email) {
    try {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            log.error("User not found for email: " + email);
            return ""; // Return an empty string or a default value indicating failure
        }
        String encryptedSecret = user.getMfaSecret();
        return UserUtility.decryptMFA(encryptedSecret);
    } catch (Exception e) {
        log.error("Error retrieving MFA secret for email: " + email, e);
        return ""; // Return an empty string or a default value indicating failure
    }
}
    

}
