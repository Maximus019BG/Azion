package com.azion.Azion.User.Controller;


import com.azion.Azion.User.Service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {
    @GetMapping("/name")
    public String name() {
        return UserService.name();
    }
    @GetMapping("/age")
    public String age() {
        return UserService.age();
    }

}
