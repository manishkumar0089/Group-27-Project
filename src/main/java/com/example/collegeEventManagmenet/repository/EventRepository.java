package com.example.collegeEventManagmenet.repository;

import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByCreatedBy(Long adminId);
}