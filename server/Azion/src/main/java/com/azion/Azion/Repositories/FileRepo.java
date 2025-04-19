package com.azion.Azion.Repositories;

import com.azion.Azion.Models.TaskFiles;
import org.springframework.data.jpa.repository.JpaRepository;



public interface FileRepo extends JpaRepository<TaskFiles, String> {

}
