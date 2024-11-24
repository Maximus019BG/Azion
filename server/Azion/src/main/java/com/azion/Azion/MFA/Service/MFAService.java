package com.azion.Azion.MFA.Service;

import com.azion.Azion.Token.TokenRepo;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Util.UserUtility;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import lombok.extern.slf4j.Slf4j;
import org.opencv.core.*;
import org.opencv.dnn.Dnn;
import org.opencv.dnn.Net;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import static org.opencv.imgproc.Imgproc.rectangle;

@Service
@Slf4j
public class MFAService {
    private static final double THRESHOLD = 13;
    private final UserRepository userRepository;
    private final TokenRepo tokenRepo;
    
    @Autowired
    public MFAService(UserRepository userRepository, TokenRepo tokenRepo) {
        this.userRepository = userRepository;
        this.tokenRepo = tokenRepo;
    }
    
    //!QR generator
    public String generateQRCodeImage(String secret, String email) {
        User user = userRepository.findByEmail(email);
        String name = user.getName();
        
        String issuer = System.getProperty("issuerName");
        QrData data = new QrData.Builder()
                .label("Azion:" + name + "/" + email)
                .secret(secret)
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
    
    //!Generate otp code !!!instead of qr code!!!
    public String generateManualEntryCode(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            log.error("User not found for email: " + email);
            return null;
        }
        String secret = getUserMFASecret(email);
        String issuer = System.getProperty("issuerName");
        return secret;
    }
    
    //!One Time Pass validation
    public boolean validateOtp(String secret, String otp) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        return verifier.isValidCode(secret, otp);
    }
    
    //*Method calling the Qr generator with user secret
    public String generateQRCodeUriForCurrentUser(String email) {
        String secret = getUserMFASecret(email);
        return generateQRCodeImage(secret, email);
    }
    
    //!Getting user secret
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
    
    //!OTP checker
    public boolean checkMfaCredentials(String email, String submittedOtp) {
        String secret = getUserMFASecret(email);
        if (secret.isEmpty()) {
            log.error("MFA secret not found for user: " + email);
            return false;
        }
        log.debug("User: " + email + " logging in with MFA");
        return validateOtp(secret, submittedOtp);
    }
    
    //Crop the face from the image using the provided rectangle
    private Mat cropToFace(Mat image, Rect faceRect) {
        return new Mat(image, faceRect);
    }
    
    //Face location
    private String faceLocation(String base64Image) throws IOException {
        //Load the face detection model
        CascadeClassifier faceDetector = new CascadeClassifier();
        InputStream faceCascadeStream = getClass().getClassLoader().getResourceAsStream("haarcascade_frontalface_alt.xml");
        if (faceCascadeStream == null) {
            throw new IOException("haarcascade_frontalface_alt.xml not found in resources");
        }
        Path tempFile = Files.createTempFile("haarcascade_frontalface_alt", ".xml");
        Files.copy(faceCascadeStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
        faceDetector.load(tempFile.toString());
        
        //Decode the base64 image
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        Mat mat = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_UNCHANGED);
        MatOfRect faceDetections = new MatOfRect();
        faceDetector.detectMultiScale(mat, faceDetections);
        
        //Crop the first detected face
        if (faceDetections.toArray().length > 0) {
            log.debug("Faces detected: " + faceDetections.toArray().length);
            Rect faceRect = faceDetections.toArray()[0]; // Assuming the first detected face is the target
            Mat faceMat = cropToFace(mat, faceRect);
            
            MatOfByte matOfByte = new MatOfByte();
            Imgcodecs.imencode(".jpg", faceMat, matOfByte);
            byte[] processedImageBytes = matOfByte.toArray();
            return Base64.getEncoder().encodeToString(processedImageBytes);
        } else {
            log.debug("No faces detected");
            return "no faces detected";
        }
    }
    
    // Recognize the face in the provided base64 image
    public String faceRecognition(String base64Image) throws IOException {
        String croppedFaceBase64 = faceLocation(base64Image);
        if ("no faces detected".equals(croppedFaceBase64)) {
            return null;
        }
        
        //Decode the cropped face img
        byte[] imageBytes = Base64.getDecoder().decode(croppedFaceBase64);
        Mat mat = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_UNCHANGED);
        Mat preprocessedImage = preprocessImage(mat);
        
        //Convert grayscale image to BGR
        Mat bgrImage = new Mat();
        Imgproc.cvtColor(preprocessedImage, bgrImage, Imgproc.COLOR_GRAY2BGR);
        
        // Load the DNN model
        InputStream modelConfigStream = getClass().getClassLoader().getResourceAsStream("deploy.prototxt");
        InputStream modelWeightsStream = getClass().getClassLoader().getResourceAsStream("res10_300x300_ssd_iter_140000.caffemodel");
        
        if (modelConfigStream == null || modelWeightsStream == null) {
            log.error("Model configuration or weights file not found in resources.");
            throw new IOException("Model configuration or weights file not found in resources.");
        }
        
        Path tempModelConfigFile = Files.createTempFile("deploy", ".prototxt");
        Path tempModelWeightsFile = Files.createTempFile("res10_300x300_ssd_iter_140000", ".caffemodel");
        
        Files.copy(modelConfigStream, tempModelConfigFile, StandardCopyOption.REPLACE_EXISTING);
        Files.copy(modelWeightsStream, tempModelWeightsFile, StandardCopyOption.REPLACE_EXISTING);
        
        String modelConfiguration = tempModelConfigFile.toString();
        String modelWeights = tempModelWeightsFile.toString();
        Net net = Dnn.readNetFromCaffe(modelConfiguration, modelWeights);
        
        //Face detection with DNN model
        Mat blob = Dnn.blobFromImage(bgrImage, 1.0, new Size(300, 300), new Scalar(104.0, 177.0, 123.0), false, false);
        net.setInput(blob);
        Mat detections = net.forward();
        
        int cols = bgrImage.cols();
        int rows = bgrImage.rows();
        detections = detections.reshape(1, (int) detections.total() / 7);
        
        StringBuilder result = new StringBuilder();
        
        //Iterate through the detections and recognize the face
        for (int i = 0; i < detections.rows(); i++) {
            double confidence = detections.get(i, 2)[0];
            if (confidence > 0.3) {
                int x1 = (int) (detections.get(i, 3)[0] * cols);
                int y1 = (int) (detections.get(i, 4)[0] * rows);
                int x2 = (int) (detections.get(i, 5)[0] * cols);
                int y2 = (int) (detections.get(i, 6)[0] * rows);
                Rect rect = new Rect(new Point(x1, y1), new Point(x2, y2));
                rectangle(bgrImage, rect, new Scalar(0, 255, 0));
                
                Mat face = new Mat(bgrImage, rect);
                double[] faceEncoding = encodeFace(face);
                String recognizedPerson = compareFaceEncoding(faceEncoding);
                if (recognizedPerson != null) {
                    result.append("User scanned before: ").append(recognizedPerson).append("\n");
                    log.debug("User scanned before: " + recognizedPerson);
                    User user = userRepository.findByEmail(recognizedPerson);
                    if (user != null) {
                        return user.getEmail();
                    } else {
                        log.debug("No user found");
                        return null;
                    }
                } else {
                    log.debug("No user found");
                    return null;
                }
            }
        }
        return null;
    }
    
    // Perform face identification for MFA faceID setup
    public String faceIdMFAScan(String base64Image, String token) throws IOException {
        //Validation
        if (token == null) {
            log.error("Token is required");
            return "Token is required";
        }
        User user = tokenRepo.findByToken(token).getSubject();
        if (user == null) {
            log.error("User not found for token: " + token);
            return "User not found for token: " + token;
        }
        //Detect the face location
        String croppedFaceBase64 = faceLocation(base64Image);
        if ("no faces detected".equals(croppedFaceBase64)) {
            return "No faces detected";
        }
        
        //Decode the cropped face img
        byte[] imageBytes = Base64.getDecoder().decode(croppedFaceBase64);
        Mat mat = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_UNCHANGED);
        Mat preprocessedImage = preprocessImage(mat);
        
        //Convert grayscale image to BGR
        Mat bgrImage = new Mat();
        Imgproc.cvtColor(preprocessedImage, bgrImage, Imgproc.COLOR_GRAY2BGR);
        
        //Load the DNN model
        InputStream modelConfigStream = getClass().getClassLoader().getResourceAsStream("deploy.prototxt");
        InputStream modelWeightsStream = getClass().getClassLoader().getResourceAsStream("res10_300x300_ssd_iter_140000.caffemodel");
        
        if (modelConfigStream == null || modelWeightsStream == null) {
            log.error("Model configuration or weights file not found in resources.");
            throw new IOException("Model configuration or weights file not found in resources.");
        }
        
        Path tempModelConfigFile = Files.createTempFile("deploy", ".prototxt");
        Path tempModelWeightsFile = Files.createTempFile("res10_300x300_ssd_iter_140000", ".caffemodel");
        
        Files.copy(modelConfigStream, tempModelConfigFile, StandardCopyOption.REPLACE_EXISTING);
        Files.copy(modelWeightsStream, tempModelWeightsFile, StandardCopyOption.REPLACE_EXISTING);
        
        String modelConfiguration = tempModelConfigFile.toString();
        String modelWeights = tempModelWeightsFile.toString();
        Net net = Dnn.readNetFromCaffe(modelConfiguration, modelWeights);
        
        //Face detection with DNN model
        Mat blob = Dnn.blobFromImage(bgrImage, 1.0, new Size(300, 300), new Scalar(104.0, 177.0, 123.0), false, false);
        net.setInput(blob);
        Mat detections = net.forward();
        
        int cols = bgrImage.cols();
        int rows = bgrImage.rows();
        detections = detections.reshape(1, (int) detections.total() / 7);
        
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < detections.rows(); i++) {
            double confidence = detections.get(i, 2)[0];
            if (confidence > 0.3) {
                int x1 = (int) (detections.get(i, 3)[0] * cols);
                int y1 = (int) (detections.get(i, 4)[0] * rows);
                int x2 = (int) (detections.get(i, 5)[0] * cols);
                int y2 = (int) (detections.get(i, 6)[0] * rows);
                Rect rect = new Rect(new Point(x1, y1), new Point(x2, y2));
                rectangle(bgrImage, rect, new Scalar(0, 255, 0));
                
                Mat face = new Mat(bgrImage, rect);
                double[] faceEncoding = encodeFace(face);
                
                //Save the face ID
                if (user.getFaceID() == null) {
                    log.debug("User face ID not found");
                    try {
                        user.setFaceID(faceEncoding);
                        userRepository.save(user);
                    } catch (Exception e) {
                        log.error("Error saving face ID for user: " + user.getEmail(), e);
                    }
                    log.debug("New user face ID saved");
                } else if (user.getFaceID() != null) {
                    return "User has face ID saved";
                } else {
                    try {
                        user.setFaceID(faceEncoding);
                        userRepository.save(user);
                    } catch (Exception e) {
                        log.error("Error saving face ID for user: " + user.getEmail(), e);
                    }
                    log.debug("New user face ID saved");
                }
            }
        }
        
        MatOfByte matOfByte = new MatOfByte();
        Imgcodecs.imencode(".jpg", bgrImage, matOfByte);
        byte[] processedImageBytes = matOfByte.toArray();
        return Base64.getEncoder().encodeToString(processedImageBytes);
    }
    
    //Grayscale and resizing
    private Mat preprocessImage(Mat image) {
        Mat grayImage = new Mat();
        Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
        Imgproc.equalizeHist(grayImage, grayImage);
        Mat resizedImage = new Mat();
        Imgproc.resize(grayImage, resizedImage, new Size(64, 64)); // consistent size
        return resizedImage;
    }
    
    //Encode the face
    private double[] encodeFace(Mat face) {
        Mat grayFace = new Mat();
        Imgproc.cvtColor(face, grayFace, Imgproc.COLOR_BGR2GRAY);
        Imgproc.equalizeHist(grayFace, grayFace);
        Mat resizedFace = new Mat();
        Imgproc.resize(grayFace, resizedFace, new Size(64, 64)); // Ensure consistent size
        
        int totalElements = (int) (resizedFace.total() * resizedFace.channels());
        byte[] faceEncoding = new byte[totalElements];
        resizedFace.get(0, 0, faceEncoding);
        
        double[] normalizedFaceEncoding = new double[totalElements];
        for (int i = 0; i < faceEncoding.length; i++) {
            normalizedFaceEncoding[i] = (faceEncoding[i] & 0xFF) / 255.0;
        }
        
        return normalizedFaceEncoding;
    }
    
    //Compare the new face encoding with stored face encodings
    public String compareFaceEncoding(double[] newFaceEncoding) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getFaceID() != null) {
                try {
                    double[] storedFaceEncoding = user.getDecryptedFaceID();
                    double distance = calculateEuclideanDistance(newFaceEncoding, storedFaceEncoding);
                    log.debug("Comparing with known face: " + user.getEmail() + ", distance: " + distance + ", threshold: " + THRESHOLD);
                    if (distance < THRESHOLD) { // Adjust threshold as needed
                        log.debug("Recognized user: " + user.getEmail() + " with distance: " + distance);
                        return user.getEmail();
                    } else {
                        log.debug("User not recognized: " + user.getEmail() + " with distance: " + distance);
                    }
                } catch (Exception e) {
                    log.error("Error decrypting face ID for user: " + user.getEmail(), e);
                }
            }
        }
        return null;
    }
    
    //Calculate the Euclidean distance between two feature vectors
    private double calculateEuclideanDistance(double[] vector1, double[] vector2) {
        if (vector1.length != vector2.length) {
            throw new IllegalArgumentException("Vector dimensions must match");
        }
        double sum = 0.0;
        for (int i = 0; i < vector1.length; i++) {
            double diff = vector1[i] - vector2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}