package com.example.collegeEventManagmenet.service;

import com.example.collegeEventManagmenet.dto.AuthResponse;
import com.example.collegeEventManagmenet.dto.LoginRequest;
import com.example.collegeEventManagmenet.dto.RegisterRequest;
import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.entity.Registration;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.enums.EventStatus;
import com.example.collegeEventManagmenet.enums.PaymentStatus;
import com.example.collegeEventManagmenet.enums.Role;
import com.example.collegeEventManagmenet.exception.DuplicateEntryException;
import com.example.collegeEventManagmenet.exception.ResourceNotFoundException;
import com.example.collegeEventManagmenet.repository.EventRepository;
import com.example.collegeEventManagmenet.repository.RegistrationRepository;
import com.example.collegeEventManagmenet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final QRService qrService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .college(request.getCollege())
                .year(request.getYear())
                .role(Role.STUDENT)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        // Register for selected events
        if (request.getEventIds() != null && !request.getEventIds().isEmpty()) {
            for (Long eventId : request.getEventIds()) {
                Event event = eventRepository.findById(eventId)
                        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

                if (event.getStatus() != EventStatus.OPEN) continue;
                if (event.getRegisteredCount() >= event.getTotalSeats()) continue;

                PaymentStatus paymentStatus = (event.getPrice() == null || event.getPrice().compareTo(BigDecimal.ZERO) == 0)
                        ? PaymentStatus.FREE : PaymentStatus.PENDING;

                Registration registration = Registration.builder()
                        .userId(user.getId())
                        .eventId(eventId)
                        .paymentStatus(paymentStatus)
                        .registeredAt(LocalDateTime.now())
                        .build();

                if (paymentStatus == PaymentStatus.FREE) {
                    registration = registrationRepository.save(registration);
                    String qrToken = qrService.generateQRToken(registration.getId(), eventId, user.getId());
                    registration.setQrToken(qrToken);
                }

                registration = registrationRepository.save(registration);
                event.setRegisteredCount(event.getRegisteredCount() + 1);
                eventRepository.save(event);

                if (paymentStatus == PaymentStatus.FREE) {
                    try {
                        byte[] qrImage = qrService.generateQRCodeImage(registration.getQrToken());
                        emailService.sendTicketEmail(user.getEmail(), user.getName(), event.getName(),
                                event.getStartTime(), event.getVenue(), qrImage);
                    } catch (Exception e) {
                        // non-fatal
                    }
                }
            }
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        String token = jwtService.generateToken(user, claims);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        if (user.getRole() == Role.VOLUNTEER && user.getAssignedEventId() != null) {
            claims.put("assignedEventId", user.getAssignedEventId());
        }

        String token = jwtService.generateToken(user, claims);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .build();
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }
}
