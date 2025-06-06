package com.azion.Azion.Models;

import com.azion.Azion.Enums.UserType;
import com.azion.Azion.Utils.UserUtility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import jakarta.persistence.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Date;
import java.util.Set;
import java.util.UUID;


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
    
    @Column(nullable = true)
    private String password;
    
    @Column(nullable = true, length = 14336)
    private String faceID;
    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> role;
    
    @Column
    private String orgid;
    
    @Lob
    @Column(name = "profilePicture", columnDefinition = "LONGBLOB")
    private byte[] profilePicture;
    
    @Column
    private boolean mfaEnabled;
    
    @Column
    private String mfaSecret;
    
    @Column(nullable = true, columnDefinition = "TEXT")
    private String resetToken;
    
    @Column(nullable = false)
    private UserType userType;
    
    @ManyToMany(mappedBy = "users")
    private Set<Org> orgs;
    
    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER, mappedBy = "users")
    private Set<Task> tasks;
    
    public String getOrgid() {
        return orgid;
    }
    
    public void setOrgid(String orgid) {
        this.orgid = orgid;
    }
    
    public Set<Task> getTasks() {
        return tasks;
    }
    
    public void setTasks(Set<Task> projects) {
        this.tasks = projects;
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
    
    public User(String name, Date age, String email, String password, double[] faceID, Set<Role> role, byte[] profilePicture) throws Exception {
        setName(name);
        setAge(age);
        setEmail(email);
        setPassword(password);
        setFaceID(faceID);
        setRoles(role);
        setProfilePicture(profilePicture);
    }
    
    public Set<Role> getRoles() {
        return role;
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
        } else {
            this.email = email;
        }
        
    }
    
    public String getFaceID() {
        return faceID;
    }
    
    public void setFaceID(double[] faceID) throws Exception {
        if (faceID == null) {
            this.faceID = null;
            return;
        }
        
        String faceIDString = UserUtility.doubleArrayToString(faceID);
        this.faceID = UserUtility.encryptFaceId(faceIDString);
    }
    
    public double[] getDecryptedFaceID() throws Exception {
        String encryptedFaceID = this.faceID;
        if (encryptedFaceID == null) {
            throw new IllegalArgumentException("Face ID cannot be null");
        }
        String decryptedFaceIDString = UserUtility.decryptFaceID(this.faceID);
        return UserUtility.stringToDoubleArray(decryptedFaceIDString);
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setRoles(Set<Role> role) {
        this.role = role;
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
    
    public String getResetToken() {
        return resetToken;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public UserType getUserType() {
        return userType;
    }
    
    public void setUserType(UserType userType) {
        this.userType = userType;
    }
    
    
    public void newMFASecret() {
        generateMfaSecret();
    }
    
    @PrePersist
    public void prePersist() {
        generateId();
        generateMfaSecret();
    }
    
    public User() {
    }
    
    public void setPassword(String password) {
        //Google login
        if (password == null) {
            this.password = null;
            return;
        }
        
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!UserUtility.isValidPassword(password)) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
        }
        this.password = BCrypt.hashpw(password, BCrypt.gensalt());
    }
    
}
