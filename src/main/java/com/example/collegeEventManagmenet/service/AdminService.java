package com.example.collegeEventManagmenet.service;

import com.example.collegeEventManagmenet.dto.AdminStatsResponse;
import com.example.collegeEventManagmenet.dto.VolunteerCreateRequest;
import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.entity.Registration;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.enums.PaymentStatus;
import com.example.collegeEventManagmenet.enums.Role;
import com.example.collegeEventManagmenet.exception.DuplicateEntryException;
import com.example.collegeEventManagmenet.exception.ResourceNotFoundException;
import com.example.collegeEventManagmenet.repository.EventRepository;
import com.example.collegeEventManagmenet.repository.RegistrationRepository;
import com.example.collegeEventManagmenet.repository.UserRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AdminStatsResponse getEventStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

        long total = registrationRepository.countByEventIdAndPaymentStatusIn(
                eventId, List.of(PaymentStatus.PAID, PaymentStatus.FREE, PaymentStatus.PENDING));
        long confirmed = registrationRepository.countByEventIdAndPaymentStatusIn(
                eventId, List.of(PaymentStatus.PAID, PaymentStatus.FREE));
        long checkedIn = registrationRepository.countByEventIdAndCheckedIn(eventId, true);

        double utilization = event.getTotalSeats() > 0
                ? (double) confirmed / event.getTotalSeats() * 100 : 0;

        return AdminStatsResponse.builder()
                .totalRegistrations(total)
                .confirmedCount(confirmed)
                .checkedInCount(checkedIn)
                .capacityUtilization(Math.round(utilization * 100.0) / 100.0)
                .totalSeats(event.getTotalSeats())
                .eventName(event.getName())
                .build();
    }

    public byte[] exportEventData(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

        List<Registration> registrations = registrationRepository.findByEventId(eventId);

        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{
                    "Registration ID", "Name", "Email", "Phone", "College", "Year",
                    "Payment Status", "QR Token", "Checked In", "Checked In At", "Registered At"
            });

            for (Registration r : registrations) {
                User user = userRepository.findById(r.getUserId()).orElse(null);
                writer.writeNext(new String[]{
                        String.valueOf(r.getId()),
                        user != null ? user.getName() : "",
                        user != null ? user.getEmail() : "",
                        user != null ? user.getPhone() : "",
                        user != null ? user.getCollege() : "",
                        user != null && user.getYear() != null ? String.valueOf(user.getYear()) : "",
                        r.getPaymentStatus().name(),
                        r.getQrToken() != null ? r.getQrToken() : "",
                        String.valueOf(r.isCheckedIn()),
                        r.getCheckedInAt() != null ? r.getCheckedInAt().toString() : "",
                        r.getRegisteredAt() != null ? r.getRegisteredAt().toString() : ""
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export data", e);
        }

        return sw.toString().getBytes();
    }

    public record VolunteerResult(User volunteer, String rawPassword) {}

    public List<Map<String, Object>> getVolunteers() {
        return userRepository.findByRole(Role.VOLUNTEER).stream().map(v -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("name", v.getName());
            map.put("email", v.getEmail());
            map.put("password", v.getPasswordHash());
            map.put("assignedEventId", v.getAssignedEventId());
            map.put("expiresAt", v.getExpiresAt());
            eventRepository.findById(v.getAssignedEventId() != null ? v.getAssignedEventId() : -1L)
                    .ifPresent(e -> map.put("eventName", e.getName()));
            return map;
        }).toList();
    }

    public VolunteerResult createVolunteer(VolunteerCreateRequest request, Long adminId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email already exists: " + request.getEmail());
        }

        Event event = eventRepository.findById(request.getAssignedEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.getAssignedEventId()));

        String rawPassword = "vol123";

        User volunteer = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role(Role.VOLUNTEER)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .assignedEventId(request.getAssignedEventId())
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .expiresAt(event.getEndTime().plusDays(1))
                .build();

        volunteer = userRepository.save(volunteer);

        return new VolunteerResult(volunteer, rawPassword);
    }

    public List<User> getVolunteersByEvent(Long eventId) {
        return userRepository.findByAssignedEventId(eventId);
    }

    public List<Map<String, Object>> getVolunteersWithPasswordsByEvent(Long eventId) {
        return userRepository.findByAssignedEventId(eventId).stream().map(v -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("name", v.getName());
            map.put("email", v.getEmail());
            map.put("password", v.getPasswordHash());
            map.put("assignedEventId", v.getAssignedEventId());
            map.put("expiresAt", v.getExpiresAt());
            eventRepository.findById(v.getAssignedEventId() != null ? v.getAssignedEventId() : -1L)
                    .ifPresent(e -> map.put("eventName", e.getName()));
            return map;
        }).toList();
    }
}
