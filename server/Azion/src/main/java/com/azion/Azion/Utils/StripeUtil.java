package com.azion.Azion.Utils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

public class StripeUtil {
    
    private static final String rawKey = System.getProperty("secretMFA");
    private static final String ALGORITHM = "AES";
    private static final byte[] SECRET_KEY = adjustKeyLength(rawKey);
    
    public static String encrypt(String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedData = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encryptedData);
    }
    
    public static String decrypt(String encryptedData) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decodedData = Base64.getDecoder().decode(encryptedData);
        return new String(cipher.doFinal(decodedData));
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
