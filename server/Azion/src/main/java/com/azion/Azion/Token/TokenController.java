package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import org.springframework.transaction.annotation.Transactional;
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
    public ResponseEntity<?> sessionCheck(@RequestBody Map<String, Object> request) {
        String refreshToken = (String) request.get("refreshToken");
        String accessToken = (String) request.get("accessToken");
        String sessionCheckResult = tokenService.sessionCheck(refreshToken, accessToken);
    
        Map<String, String> response = new HashMap<>();
        switch (sessionCheckResult) {
            case "newAccessToken":
                String newAccessToken = tokenService.regenerateAccessToken(refreshToken);
                if (newAccessToken != null) {
                    response.put("accessToken", newAccessToken);
                    response.put("message", "newAccessToken generated");
                    System.out.println("newAccessToken generated");
                
                    return ResponseEntity.ok(response);
                } else {
                    System.out.println("newAccessToken failed");
                    response.put("message", "Both tokens are expired. Please log in again.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            case "true":
                response.put("message", "success");
                return ResponseEntity.ok(response);
            case "false":
                System.out.println("sessionCheck failed");
                response.put("message", "sessionCheck failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            default:
                response.put("message", "sessionCheck failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}