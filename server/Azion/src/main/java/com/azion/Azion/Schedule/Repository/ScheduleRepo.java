package com.azion.Azion.Schedule.Repository;

import com.azion.Azion.Schedule.Model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepo extends JpaRepository<Schedule, String> {
}
