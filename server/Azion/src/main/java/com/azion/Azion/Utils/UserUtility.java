package com.azion.Azion.Utils;

import org.apache.commons.codec.binary.Base32;
import org.apache.commons.validator.routines.EmailValidator;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class UserUtility {

    private static final String rawKey = System.getProperty("secretMFA");
    private static final String ALGORITHM = "AES";
    private static final byte[] key = adjustKeyLength(rawKey);
    
    public static boolean isValidPhone(String phone) {
        return phone.matches("^\\+?[0-9]{7,15}$");
    }
    
    public static boolean isValidEmail(String email) {
        EmailValidator emailValidator = EmailValidator.getInstance();
        return emailValidator.isValid(email);
    }

    public static String encryptMFA(String value) throws Exception {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
        byte[] encryptedValue = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedValue);
    }

    public static String decryptMFA(String value) throws Exception {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
        byte[] decryptedValue = cipher.doFinal(Base64.getDecoder().decode(value));
        return new String(decryptedValue, StandardCharsets.UTF_8);
    }
    
    
    public static String encryptFaceId(String data) throws Exception {
        if (data == null) {
            throw new IllegalArgumentException("Face ID cannot be null");
        }
        byte[] compressedData = compress(data.getBytes(StandardCharsets.UTF_8));
        SecretKeySpec secretKey = new SecretKeySpec(key, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedData = cipher.doFinal(compressedData);
        Base32 base32 = new Base32();
        return base32.encodeToString(encryptedData); // Use Base32 encoding
    }
    
    public static String decryptFaceID(String encryptedData) throws Exception {
        if (encryptedData == null) {
            throw new IllegalArgumentException("Encrypted face ID cannot be null");
        }
        SecretKeySpec secretKey = new SecretKeySpec(key, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        Base32 base32 = new Base32();
        byte[] decodedData = base32.decode(encryptedData); // Use Base32 decoding
        byte[] decryptedData = cipher.doFinal(decodedData);
        return new String(decompress(decryptedData), StandardCharsets.UTF_8);
    }
    
    private static byte[] compress(byte[] data) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
            gzipOutputStream.write(data);
        }
        return byteArrayOutputStream.toByteArray();
    }
    
    private static byte[] decompress(byte[] data) throws IOException {
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(data);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(byteArrayInputStream)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipInputStream.read(buffer)) != -1) {
                byteArrayOutputStream.write(buffer, 0, len);
            }
        }
        return byteArrayOutputStream.toByteArray();
    }
    
    private static byte[] adjustKeyLength(String key) {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] adjustedKey = new byte[32];
        Arrays.fill(adjustedKey, (byte) 0);
        
        if (keyBytes.length > 32) {
            System.arraycopy(keyBytes, 0, adjustedKey, 0, 32);
        } else {
            System.arraycopy(keyBytes, 0, adjustedKey, 0, keyBytes.length);
        }
        return adjustedKey;
    }
    public static String doubleArrayToString(double[] array) {
        StringBuilder sb = new StringBuilder();
        for (double d : array) {
            sb.append(d).append(",");
        }
        return sb.toString();
    }
    
    public static double[] stringToDoubleArray(String s) {
        String[] parts = s.split(",");
        double[] array = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            array[i] = Double.parseDouble(parts[i]);
        }
        return array;
    }
    
    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasUpperCase = false;
        boolean hasLowerCase = false;
        boolean hasDigit = false;
        boolean hasSpecialChar = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                hasUpperCase = true;
            } else if (Character.isLowerCase(c)) {
                hasLowerCase = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            } else if (!Character.isLetterOrDigit(c)) {
                hasSpecialChar = true;
            }
        }
        
        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }
    
}