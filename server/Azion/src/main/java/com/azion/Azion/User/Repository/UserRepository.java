package com.azion.Azion.User.Repository;

import com.azion.Azion.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    User findByResetToken(String resetToken);
    User findByEmail(String email);
    User findByPassword(String password);
    
    List<User> findByRoleLevelAndOrgid(int roleLevel, String orgid);
    List<User> findByRoleAndOrgid(String role, String orgid);
    List<User> findByOrgid(String orgid);

}
