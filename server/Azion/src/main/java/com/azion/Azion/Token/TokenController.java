package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;

@RequestMapping("/api/token")
@Controller
public class TokenController {
    private final TokenService tokenService;
    private final UserService userService;
    private final TokenRepo tokenRepo;
    private final UserRepository userRepository;

    public TokenController(TokenService tokenService, UserService userService, TokenRepo tokenRepo, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userService = userService;
        this.tokenRepo = tokenRepo;
        this.userRepository = userRepository;
    }

    @Transactional
    @PostMapping("/session/check")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String refreshToken = (String) request.get("refreshToken");
        String accessToken = (String) request.get("accessToken");
        Token tokenObj = tokenRepo.findByToken(accessToken);
      
        Map<String, String> response = new HashMap<>();
        
        if(tokenObj == null){
            response.put("message", "sessionCheck failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = tokenObj.getSubject();
       
        if (user == null) {
            response.put("message", "sessionCheck failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        else if (Objects.equals(tokenService.sessionCheck(refreshToken, accessToken), "newAccessToken")) {
            tokenRepo.delete(tokenObj);
            String newAccessToken = tokenService.generateToken(ACCESS_TOKEN, user, System.getProperty("issuerName"), "https://azion.net/");
          
            response.put("accessToken", newAccessToken);
            response.put("message", "newAccessToken generated");
            
            return ResponseEntity.ok(response);
        }
        else if (Objects.equals(tokenService.sessionCheck(refreshToken, accessToken), "false")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("sessionCheck failed");
        }
        else if (Objects.equals(tokenService.sessionCheck(refreshToken, accessToken), "true")) {
            response.put("message", "success");
            return ResponseEntity.ok(response);
        }
        else{
            return ResponseEntity.ok("sessionCheck failed");
        }
    }
}
