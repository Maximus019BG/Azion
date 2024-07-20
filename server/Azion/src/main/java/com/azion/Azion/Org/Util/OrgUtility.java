package com.azion.Azion.Org.Util;

import org.apache.commons.validator.routines.EmailValidator;

public class OrgUtility {
    
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
    
}
