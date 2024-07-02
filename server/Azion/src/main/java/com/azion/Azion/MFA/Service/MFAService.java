package com.azion.Azion.MFA.Service;

import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MFAService {
  
    public String generateNewSecret(){
        return new DefaultSecretGenerator().generate();
    }
    public String generateQRCodeImage(String secret){
        QrData data = new QrData.Builder()
                .label("Azion MFA")
                .secret(secret)
                .issuer(System.getProperty("issuerName"))
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
    
    public boolean OtpValid(String secret, String code){
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        return verifier.isValidCode(secret, code);
    }
    
    public boolean OtpNotValid(String secret, String code){
        return !OtpValid(secret, code);
    }

}
