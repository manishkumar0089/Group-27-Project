package com.example.collegeEventManagmenet.repository;

import com.example.collegeEventManagmenet.entity.Registration;
import com.example.collegeEventManagmenet.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    List<Registration> findByEventId(Long eventId);
    Optional<Registration> findByQrToken(String qrToken);
    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);
    long countByEventIdAndPaymentStatusIn(Long eventId, List<PaymentStatus> statuses);

    @Query("SELECT COUNT(r) FROM Registration r WHERE r.eventId = :eventId AND r.checkedIn = :checkedIn")
    long countByEventIdAndCheckedIn(@Param("eventId") Long eventId, @Param("checkedIn") boolean checkedIn);

    @Query("SELECT r FROM Registration r WHERE r.eventId = :eventId AND r.checkedIn = :checkedIn ORDER BY r.checkedInAt DESC")
    List<Registration> findByEventIdAndCheckedInOrderByCheckedInAtDesc(@Param("eventId") Long eventId, @Param("checkedIn") boolean checkedIn);
}