package com.azion.Azion.Org.Util;

import org.apache.commons.validator.routines.EmailValidator;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

public class OrgUtility {
    private static final String rawKey = System.getProperty("secretMFA");
    private static final String ALGORITHM = "AES";
    private static final byte[] KEY = adjustKeyLength(rawKey);
    
    public static boolean isValidOrgEmail(String email) {
        EmailValidator emailValidator = EmailValidator.getInstance();
        return emailValidator.isValid(email);
    }
    public static boolean isValidOrgAddress(String address) {
        if(address == null) return false;
        else if(address.matches(".*\\d.*")) {
            return true;
        }
        else{
            return false;
        }
    }
    
    public static String encrypt(String data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Error while encrypting", e);
        }
    }
    
    public static String decrypt(String encryptedData) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedData)));
        } catch (Exception e) {
            throw new RuntimeException("Error while decrypting", e);
        }
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
    
}
