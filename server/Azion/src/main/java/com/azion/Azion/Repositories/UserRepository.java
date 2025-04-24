package com.azion.Azion.Repositories;

import com.azion.Azion.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    User findByResetToken(String resetToken);
    User findByEmail(String email);
    List<User> findByOrgid(String orgid);
    
    //Find by domain on email
    @Query("SELECT u FROM User u WHERE LOWER(SUBSTRING(u.email, LOCATE('@', u.email) + 1)) = LOWER(SUBSTRING(:email, LOCATE('@', :email) + 1))")
    List<User> findByEmailDomain(@Param("email") String email);
    
    //Get random user
    @Query("SELECT u FROM User u ORDER BY FUNCTION('RAND')")
    List<User> findRandomUser();

}
