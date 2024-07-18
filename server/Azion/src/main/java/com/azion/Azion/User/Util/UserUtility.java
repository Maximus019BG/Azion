package com.azion.Azion.User.Util;
import io.github.cdimascio.dotenv.Dotenv;
import org.apache.commons.validator.routines.EmailValidator;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;


public class UserUtility {
    
    static Dotenv dotenv = Dotenv.load();
    
    private static final String key = dotenv.get("secretMFA");
    private static final String ALGORITHM = "AES";
    
    
    public static boolean isValidEmail(String email) {
        EmailValidator emailValidator = EmailValidator.getInstance();
        return emailValidator.isValid(email);
    }
    
    public static String encryptMFA(String value) throws Exception {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
        byte[] encryptedValue = cipher.doFinal(value.getBytes());
        return Base64.getEncoder().encodeToString(encryptedValue);
    }
    
    public static String decryptMFA(String value) throws Exception {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
        byte[] decryptedValue = cipher.doFinal(Base64.getDecoder().decode(value));
        return new String(decryptedValue);
    }
   
}
