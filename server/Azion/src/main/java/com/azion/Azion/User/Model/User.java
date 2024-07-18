package com.azion.Azion.User.Model;

import com.azion.Azion.User.Util.UserUtility;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import jakarta.persistence.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Date;
import java.util.Set;
import java.util.UUID;
import com.azion.Azion.Projects.Model.Project;


@Entity
@Table(name = "users_azion")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Date age;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String faceID;

    @Column(nullable = false)
    private String role;

    @Column
    private String orgid;
    
    @Lob
    @Column(name = "profilePicture")
    private byte[] profilePicture;
    
    @Column
    private boolean mfaEnabled;
    
    @Column
    private String mfaSecret ;
    
    
    @ManyToMany(mappedBy = "users")
    private Set<Project> projects;

    public String getOrgid() {
        return orgid;
    }

    public void setOrgid(String orgid) {
        this.orgid = orgid;
    }
    
    public Set<Project> getProjects() {
        return projects;
    }
    
    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }
    
    
   
    private void generateId() {
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

    public Date getAge() {
        return age;
    }

    public void setAge(Date age) {
        this.age = age;
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
    
    public byte[] getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public boolean isMfaEnabled() {
        return mfaEnabled;
    }
    
    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
    }
    
    public String getMfaSecret() {
        return mfaSecret;
    }
    
    public void setMfaSecret(String mfaSecret) {
        this.mfaSecret = mfaSecret;
    }
    
  private void generateMfaSecret() {
    DefaultSecretGenerator generator = new DefaultSecretGenerator();
    String mfaSecretGenerated = generator.generate();
    try {
        this.mfaSecret = UserUtility.encryptMFA(mfaSecretGenerated);
    } catch (Exception e) {
        this.mfaSecret = "no Secret";
    }
}
    

    @PrePersist
    public void prePersist() {
        generateId();
        generateMfaSecret();
    }
    
    public User() {
    }
    public User(String name, Date age, String email, String password, String faceID, String role, byte[] profilePicture) {
        setName(name);
        setAge(age);
        setEmail(email);
        setPassword(password);
        setFaceID(faceID);
        setRole(role);
        setProfilePicture(profilePicture);
    }
    
}
