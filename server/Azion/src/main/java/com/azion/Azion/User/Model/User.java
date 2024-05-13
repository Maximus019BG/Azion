package com.azion.Azion.User.Model;

import com.azion.Azion.User.Util.UserUtility;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.persistence.*;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.context.annotation.Primary;
import io.github.cdimascio.dotenv.Dotenv;


import java.util.UUID;


@Entity
@Table(name = "users_azion")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String faceID;

    @Column(nullable = false)
    private String role;



    @PrePersist
    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if(age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
        else {
            this.age = age;
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (!UserUtility.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        else{
            this.email = email;
        }

    }

    public String getFaceID() {
        return faceID;
    }

    public void setFaceID(String faceID) {
        this.faceID = faceID;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public User() {
    }
    public User(String name, int age, String email, String password, String faceID, String role) {
        setName(name);
        setAge(age);
        setEmail(email);
        setPassword(password);
        setFaceID(faceID);
        setRole(role);
    }





}
