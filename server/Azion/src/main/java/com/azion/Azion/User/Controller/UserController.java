package com.azion.Azion.User.Controller;


import com.azion.Azion.User.Model.Token;
import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import com.azion.Azion.User.Service.UserService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/auth/register/{email}")
    public User createUser(@PathVariable String email) {
        User user = new User();
        user.setName("Hardcoded Name");
        user.setAge(30);
        user.setEmail(email);
        user.setPassword("hardcodedPassword");
        user.setFaceID("hardcodedFaceID");
        user.setRole("hardcodedRole");
        return userService.createUser(user);
    }
    
@GetMapping("/auth/login/{email}/{password}")
public ResponseEntity<?> loginUser(@PathVariable String email, @PathVariable String password, HttpServletResponse response) {
    try {
        
        String secret = System.getProperty("secretJWT");
        Token token = userService.loginUser(email, password, secret, response);
        return ResponseEntity.ok(token);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }
}
    
    @GetMapping("/delete/{email}")
    public ResponseEntity<?> removeUserFromOrg(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        userRepository.delete(user);
        return ResponseEntity.ok("User with email " + email + " deleted");
    }



}