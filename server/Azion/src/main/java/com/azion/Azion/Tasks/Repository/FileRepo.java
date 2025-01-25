package com.azion.Azion.Tasks.Repository;

import com.azion.Azion.Tasks.Model.TaskFiles;
import org.springframework.data.jpa.repository.JpaRepository;



public interface FileRepo extends JpaRepository<TaskFiles, String> {

}
