package com.azion.Azion.Auth;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    
    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public boolean checkFaceIdEnabled(String email) {
        User user = userRepository.findByEmail(email);
        if(user != null && user.getFaceID() != null){
           return true;
        }
        else {
            return false;
        }
    }
    
    
}
