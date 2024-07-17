package com.azion.Azion.MFA.Service;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import io.github.cdimascio.dotenv.Dotenv;
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
        Dotenv env = Dotenv.load();
        
        String issuer = env.get("issuerName");
        QrData data = new QrData.Builder()
                .label("Azion: "+ email)
                .secret(secret)
                .issuer(issuer)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        QrGenerator generator = new ZxingPngQrGenerator();
        
        System.out.println("Generating QR code for secret: " + getUserMFASecret(email));
        
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
       User user = userRepository.findByEmail(email);
//       String secret = user.getPlainMfaSecret();
       
       //TODO:store the secret in a secure way
        DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();
       return secret;
    }
    

}
