package com.azion.Azion.Token;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.azion.Azion.Token.TokenType.ACCESS_TOKEN;
import static com.azion.Azion.Token.TokenType.REFRESH_TOKEN;

@Slf4j
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
    public ResponseEntity<?> sessionCheck(@RequestBody Map<String, Object> request, @RequestHeader(value = "User-Agent") String UserAgent) {
        String refreshToken = (String) request.get("refreshToken");
        String accessToken = (String) request.get("accessToken");
        String sessionCheckResult = tokenService.sessionCheck(refreshToken, accessToken);
        
        Map<String, String> response = new HashMap<>();
        switch (sessionCheckResult) {
            case "newAccessToken":
                String newAccessToken = tokenService.regenerateAccessToken(refreshToken, UserAgent);
                if (newAccessToken != null) {
                    response.put("accessToken", newAccessToken);
                    response.put("message", "newAccessToken generated");
                    
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Both tokens are expired. Please log in again.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            case "true":
                response.put("message", "success");
                return ResponseEntity.ok(response);
            case "false":
                response.put("message", "sessionCheck failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            default:
                response.put("message", "sessionCheck failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @Transactional
    @GetMapping("/sessions/show/{accessToken}")
    public ResponseEntity<?> showSessions(@PathVariable String accessToken) {
        Token tokenObj = tokenRepo.findByToken(accessToken);
        User user = tokenObj.getSubject();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        List<TokenPlatformResponse> tokens = tokenService.showAllTokens(accessToken);
        return ResponseEntity.ok(tokens);
    }
    
    @Transactional
    @PutMapping("/sessions/delete/one")
    public ResponseEntity<?> deleteOne(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");
        String removeToken = request.get("removeToken");
        Token tokenObjUser = tokenRepo.findByToken(accessToken);
        if (tokenObjUser == null) {
            return ResponseEntity.status(HttpStatus.NON_AUTHORITATIVE_INFORMATION).body("Not authorized to delete this token.");
        }
        User userCurrent = tokenObjUser.getSubject();
        if (userCurrent == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        Token tokenObj = tokenRepo.findByToken(removeToken);
        if (tokenObj == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Token not found.");
        }
        User user = tokenObj.getSubject();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        tokenObj.setSubject(null);
        tokenRepo.save(tokenObj);
        tokenRepo.delete(tokenObj);
        return ResponseEntity.ok("Token deleted.");
    }
    
    @Transactional
    @PutMapping("/sessions/delete")
    public ResponseEntity<?> deleteSessions(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");
        String refreshToken = request.get("refreshToken");
        Token tokenObj = tokenRepo.findByToken(accessToken);
        if (tokenObj == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Token not found.");
        }
        User user = tokenObj.getSubject();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        tokenService.deleteAllTokens(user, accessToken, ACCESS_TOKEN);
        tokenService.deleteAllTokens(user, refreshToken, REFRESH_TOKEN);
        return ResponseEntity.ok("All sessions deleted except the provided access token.");
    }
}