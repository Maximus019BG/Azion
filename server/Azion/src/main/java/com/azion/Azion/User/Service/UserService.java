package com.azion.Azion.User.Service;


import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.azion.Azion.MFA.Service.MFAService;
import com.azion.Azion.Token.Token;
import com.azion.Azion.Token.TokenService;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Returns.UserReturns;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserReturns userReturns;
    private final MFAService mfaService;
    private final TokenService tokenService;
    
    
    //Constructor
    @Autowired
    public UserService(UserRepository userRepository,UserReturns userReturns, MFAService mfaService, TokenService tokenService) {
        this.userRepository = userRepository;
        this.userReturns = userReturns;
        this.mfaService = mfaService;
        this.tokenService = tokenService;
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