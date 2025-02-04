package com.azion.Azion.User.Model;

import com.azion.Azion.Tasks.Model.Task;
import com.azion.Azion.User.Util.UserUtility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @Column(nullable = false)
    private String password;
    
    @Column(nullable = true, length = 14336)
    private String faceID;
    
    @ManyToOne
    @JoinColumn(nullable = true)
    @JsonManagedReference
    private Role role;

    @Column
    private String orgid;
    
    @Lob
    @Column(name = "profilePicture", columnDefinition = "LONGBLOB")
    private byte[] profilePicture;
    
    @Column
    private boolean mfaEnabled;
    
    @Column
    private String mfaSecret ;
    
    @Column(nullable = true, columnDefinition = "TEXT")
    private String resetToken;
    
    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER, mappedBy = "users")
    private Set<Task> projects;
    
    
    public String getOrgid() {
        return orgid;
    }

    public void setOrgid(String orgid) {
        this.orgid = orgid;
    }
    
    public Set<Task> getTasks() {
        return projects;
    }
    
    public void setTasks(Set<Task> projects) {
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
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
    
    public void setFaceID(double[] faceID) throws Exception {
        if(faceID == null){
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
    
    public String getResetToken() {
        return resetToken;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    
    public void newMFASecret(){
        generateMfaSecret();
    }
    
    @PrePersist
    public void prePersist() {
        generateId();
        generateMfaSecret();
    }
    
    public User() {
    }
    public User(String name, Date age, String email, String password, double[] faceID, Role role, byte[] profilePicture) throws Exception {
        setName(name);
        setAge(age);
        setEmail(email);
        setPassword(password);
        setFaceID(faceID);
        setRole(role);
        setProfilePicture(profilePicture);
    }
    
}
