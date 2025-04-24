package com.azion.Azion.Repositories;

import com.azion.Azion.Models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    
    List<Message> findMessageByToUserAndFromUser(String toUser, String fromUser);
}