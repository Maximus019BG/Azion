package com.azion.Azion.User.Controller;


import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{email}")
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
}