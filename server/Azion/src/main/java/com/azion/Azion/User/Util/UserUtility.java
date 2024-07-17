package com.azion.Azion.User.Util;
import org.apache.commons.validator.routines.EmailValidator;


public class UserUtility {

    public static boolean isValidEmail(String email) {
        EmailValidator emailValidator = EmailValidator.getInstance();
        return emailValidator.isValid(email);
    }
   
}
