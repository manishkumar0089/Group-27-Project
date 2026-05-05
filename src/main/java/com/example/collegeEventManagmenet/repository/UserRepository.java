package com.example.collegeEventManagmenet.repository;

import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRoleAndAssignedEventId(Role role, Long assignedEventId);
    List<User> findByAssignedEventId(Long eventId);
}