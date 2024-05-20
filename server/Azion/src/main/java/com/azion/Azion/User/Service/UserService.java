package com.azion.Azion.User.Service;


import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import com.azion.Azion.User.Model.Token;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TokenService TokenService;
   ;
    
    
    //Constructor
    @Autowired
    public UserService(UserRepository userRepository, TokenService tokenService) {
        this.userRepository = userRepository;
        this.TokenService = tokenService;
       
    }

   public User createUser(User user) {
        //Check for existing user
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        return userRepository.save(user);
    }
    
    public Token loginUser(String email, String password, String secret, HttpServletResponse response) {
        User user = userRepository.findByEmail(email);
        if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        Token token = TokenService.createToken(user, secret);
        
        // Token -> Cookie
        Cookie jwtCookie = new Cookie("jwt", token.getJwtToken());
        Cookie refreshTokenCookie = new Cookie("refreshToken", token.getRefreshToken());
        response.addCookie(jwtCookie);
        response.addCookie(refreshTokenCookie);
        
        //Send the token
        return token;
    }
    
    public void logoutUser(HttpServletResponse response) {
        
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setMaxAge(0);
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(jwtCookie);
        response.addCookie(refreshTokenCookie);
    }

}