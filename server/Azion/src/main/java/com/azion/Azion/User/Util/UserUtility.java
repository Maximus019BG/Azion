package com.azion.Azion.User.Util;

import io.github.cdimascio.dotenv.Dotenv;
import org.apache.commons.validator.routines.EmailValidator;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

public class UserUtility {

    private static final String rawKey = System.getProperty("secretMFA");
    private static final String ALGORITHM = "AES";

    // Adjust the key to ensure it's 32 bytes long for AES-256
    private static final byte[] key = adjustKeyLength(rawKey);

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

    // Method to adjust the AES key length
    private static byte[] adjustKeyLength(String key) {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] adjustedKey = new byte[32]; // AES-256 requires a 32 byte key
        Arrays.fill(adjustedKey, (byte) 0);
        
        if (keyBytes.length > 32) {
            System.arraycopy(keyBytes, 0, adjustedKey, 0, 32);
        } else {
            System.arraycopy(keyBytes, 0, adjustedKey, 0, keyBytes.length);
        }
        return adjustedKey;
    }
}