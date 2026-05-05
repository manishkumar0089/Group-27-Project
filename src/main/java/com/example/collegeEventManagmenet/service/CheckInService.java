package com.example.collegeEventManagmenet.service;

import com.example.collegeEventManagmenet.dto.CheckInResponse;
import com.example.collegeEventManagmenet.dto.RegistrationResponse;
import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.entity.Registration;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.exception.ResourceNotFoundException;
import com.example.collegeEventManagmenet.repository.EventRepository;
import com.example.collegeEventManagmenet.repository.RegistrationRepository;
import com.example.collegeEventManagmenet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QRService qrService;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public CheckInResponse scanQR(String qrToken, Long volunteerId, Long volunteerEventId) {
        Map<String, Object> payload;
        try {
            payload = qrService.verifyAndDecodeToken(qrToken);
        } catch (Exception e) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Invalid QR code")
                    .status("INVALID")
                    .build();
        }

        Long registrationId = ((Number) payload.get("registrationId")).longValue();
        Long eventId = ((Number) payload.get("eventId")).longValue();

        // Check event match for volunteers
        if (volunteerEventId != null && !volunteerEventId.equals(eventId)) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("This ticket is for a different event")
                    .status("WRONG_EVENT")
                    .build();
        }

        // Atomic duplicate check using Redis
        String redisKey = "checkin:" + registrationId;
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "1", 24, TimeUnit.HOURS);

        if (Boolean.FALSE.equals(isNew)) {
            Registration reg = registrationRepository.findById(registrationId).orElseThrow();
            User user = userRepository.findById(reg.getUserId()).orElseThrow();
            Event event = eventRepository.findById(eventId).orElseThrow();
            return CheckInResponse.builder()
                    .success(false)
                    .message("Already checked in")
                    .attendeeName(user.getName())
                    .eventName(event.getName())
                    .checkedInAt(reg.getCheckedInAt())
                    .status("ALREADY_SCANNED")
                    .build();
        }

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        registration.setCheckedIn(true);
        registration.setCheckedInAt(LocalDateTime.now());
        registration.setCheckedInBy(volunteerId);
        registrationRepository.save(registration);

        Event event = eventRepository.findById(eventId).orElseThrow();
        event.setCheckedInCount(event.getCheckedInCount() + 1);
        eventRepository.save(event);

        User attendee = userRepository.findById(registration.getUserId()).orElseThrow();

        return CheckInResponse.builder()
                .success(true)
                .message("Check-in successful! Welcome " + attendee.getName())
                .attendeeName(attendee.getName())
                .eventName(event.getName())
                .checkedInAt(registration.getCheckedInAt())
                .status("VALID")
                .build();
    }

    public List<RegistrationResponse> searchAttendee(String query, Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .filter(r -> {
                    User user = userRepository.findById(r.getUserId()).orElse(null);
                    if (user == null) return false;
                    return (user.getPhone() != null && user.getPhone().contains(query))
                            || r.getId().toString().contains(query)
                            || user.getName().toLowerCase().contains(query.toLowerCase());
                })
                .map(r -> {
                    Event event = eventRepository.findById(r.getEventId()).orElse(null);
                    User user = userRepository.findById(r.getUserId()).orElse(null);
                    return RegistrationResponse.builder()
                            .id(r.getId())
                            .userId(r.getUserId())
                            .eventId(r.getEventId())
                            .eventName(event != null ? event.getName() : null)
                            .eventVenue(event != null ? event.getVenue() : null)
                            .eventStartTime(event != null ? event.getStartTime() : null)
                            .qrToken(r.getQrToken())
                            .paymentStatus(r.getPaymentStatus())
                            .checkedIn(r.isCheckedIn())
                            .registeredAt(r.getRegisteredAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CheckInResponse manualCheckIn(Long registrationId, Long volunteerId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + registrationId));

        if (registration.isCheckedIn()) {
            return CheckInResponse.builder()
                    .success(false)
                    .message("Already checked in")
                    .status("ALREADY_SCANNED")
                    .build();
        }

        String redisKey = "checkin:" + registrationId;
        redisTemplate.opsForValue().set(redisKey, "1", 24, TimeUnit.HOURS);

        registration.setCheckedIn(true);
        registration.setCheckedInAt(LocalDateTime.now());
        registration.setCheckedInBy(volunteerId);
        registrationRepository.save(registration);

        Event event = eventRepository.findById(registration.getEventId()).orElseThrow();
        event.setCheckedInCount(event.getCheckedInCount() + 1);
        eventRepository.save(event);

        User attendee = userRepository.findById(registration.getUserId()).orElseThrow();

        return CheckInResponse.builder()
                .success(true)
                .message("Manual check-in successful!")
                .attendeeName(attendee.getName())
                .eventName(event.getName())
                .checkedInAt(registration.getCheckedInAt())
                .status("VALID")
                .build();
    }

    public List<RegistrationResponse> getRecentCheckIns(Long eventId) {
        return registrationRepository
                .findByEventIdAndCheckedInOrderByCheckedInAtDesc(eventId, true)
                .stream()
                .limit(20)
                .map(r -> {
                    Event event = eventRepository.findById(r.getEventId()).orElse(null);
                    return RegistrationResponse.builder()
                            .id(r.getId())
                            .userId(r.getUserId())
                            .eventId(r.getEventId())
                            .eventName(event != null ? event.getName() : null)
                            .checkedIn(r.isCheckedIn())
                            .registeredAt(r.getCheckedInAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
