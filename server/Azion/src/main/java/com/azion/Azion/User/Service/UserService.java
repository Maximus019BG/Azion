package com.azion.Azion.User.Service;

import com.azion.Azion.User.Model.User;
import com.azion.Azion.User.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    //Constructor
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

   public User createUser(User user) {
        //Check for existing user
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        return userRepository.save(user);
    }

}