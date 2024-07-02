package com.azion.Azion.User.Service;


import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Returns.UserReturns;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserReturns userReturns;
    private final MFAService mfaService;
    
    
    //Constructor
    @Autowired
    public UserService(UserRepository userRepository,UserReturns userReturns, MFAService mfaService) {
        this.userRepository = userRepository;
        this.userReturns = userReturns;
        this.mfaService = mfaService;
    }

   public UserReturns createUser(User user) {
        //Check for existing user
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        userRepository.save(user);
        return UserReturns.builder()
                .accessToken("someAccessToken")
                .refreshToken("someRefreshToken")
                .mfaEnabled(user.isMfaEnabled())
                .secretImageUri(mfaService.generateQRCodeImage(user.getMfaSecret()))
                .build();
    }
    
 
    
    public void logoutUser(HttpServletResponse response) {
        
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setMaxAge(0);
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(jwtCookie);
        response.addCookie(refreshTokenCookie);
    }
    
    public User updateProfilePicture(String id, byte[] profilePicture) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setProfilePicture(profilePicture);
            return userRepository.save(user);
        }
        return null;
    }

}