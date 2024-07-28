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
import org.opencv.imgproc.Imgproc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import static java.lang.System.loadLibrary;
import static org.opencv.imgproc.Imgproc.rectangle;


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
        
        String issuer = System.getProperty("issuerName");
        QrData data = new QrData.Builder()
                .label(name + "/" + email)
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
                return "";
            }
            String encryptedSecret = user.getMfaSecret();
            return UserUtility.decryptMFA(encryptedSecret);
        } catch (Exception e) {
            log.error("Error retrieving MFA secret for email: " + email, e);
            return "";
        }
    }
    public boolean checkMfaCredentials(String email, String submittedOtp) {
        String secret = getUserMFASecret(email);
        if (secret.isEmpty()) {
            log.error("MFA secret not found for user: " + email);
            return false;
        }
        log.info("User: " + email + "logging in with MFA");
        return validateOtp(secret, submittedOtp);
    }
    
    public String faceRecognition(String base64Image) throws IOException {
        CascadeClassifier faceDetector = new CascadeClassifier();
        faceDetector.load(getClass().getClassLoader().getResource("haarcascade_frontalface_alt.xml").getPath());
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        Mat mat = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_UNCHANGED);
        MatOfRect faceDetections = new MatOfRect();
        faceDetector.detectMultiScale(mat, faceDetections);
        
        if(faceDetections.toArray().length > 0){
            log.info("Faces detected: " + faceDetections.toArray().length);
        }
        else if(faceDetections.toArray().length == 0){
            log.info("No faces detected");
            return "no faces detected";
        }
        for (Rect rect : faceDetections.toArray()) {
            rectangle(mat, new Point(rect.x, rect.y), new Point(rect.x + rect.width, rect.y + rect.height), new Scalar(0, 255, 0));
        }
        
        MatOfByte matOfByte = new MatOfByte();
        Imgcodecs.imencode(".jpg", mat, matOfByte);
        byte[] processedImageBytes = matOfByte.toArray();
        return Base64.getEncoder().encodeToString(processedImageBytes);
    }
    
}

    


