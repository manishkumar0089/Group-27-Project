package com.example.collegeEventManagmenet.service;

import com.example.collegeEventManagmenet.dto.RegistrationResponse;
import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.entity.Registration;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.enums.EventStatus;
import com.example.collegeEventManagmenet.enums.PaymentStatus;
import com.example.collegeEventManagmenet.exception.DuplicateEntryException;
import com.example.collegeEventManagmenet.exception.ResourceNotFoundException;
import com.example.collegeEventManagmenet.repository.EventRepository;
import com.example.collegeEventManagmenet.repository.RegistrationRepository;
import com.example.collegeEventManagmenet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QRService qrService;
    private final EmailService emailService;

    @Transactional
    public RegistrationResponse registerForEvent(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

        if (event.getStatus() != EventStatus.OPEN) {
            throw new IllegalArgumentException("Event is not open for registration");
        }

        if (event.getRegisteredCount() >= event.getTotalSeats()) {
            throw new IllegalArgumentException("Event is full");
        }

        registrationRepository.findByUserIdAndEventId(userId, eventId).ifPresent(r -> {
            throw new DuplicateEntryException("Already registered for this event");
        });

        PaymentStatus paymentStatus = (event.getPrice() == null || event.getPrice().compareTo(BigDecimal.ZERO) == 0)
                ? PaymentStatus.FREE : PaymentStatus.PENDING;

        Registration registration = Registration.builder()
                .userId(userId)
                .eventId(eventId)
                .paymentStatus(paymentStatus)
                .registeredAt(LocalDateTime.now())
                .build();

        registration = registrationRepository.save(registration);

        if (paymentStatus == PaymentStatus.FREE) {
            String qrToken = qrService.generateQRToken(registration.getId(), eventId, userId);
            registration.setQrToken(qrToken);
            registration = registrationRepository.save(registration);

            User user = userRepository.findById(userId).orElseThrow();
            try {
                byte[] qrImage = qrService.generateQRCodeImage(qrToken);
                emailService.sendTicketEmail(user.getEmail(), user.getName(), event.getName(),
                        event.getStartTime(), event.getVenue(), qrImage);
            } catch (Exception e) {
                // non-fatal
            }
        }

        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepository.save(event);

        return toResponse(registration, event);
    }

    @Transactional
    public RegistrationResponse verifyPayment(Long registrationId, String txnId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + registrationId));

        registration.setPaymentStatus(PaymentStatus.PAID);
        registration.setPaymentTxnId(txnId);

        String qrToken = qrService.generateQRToken(registration.getId(), registration.getEventId(), registration.getUserId());
        registration.setQrToken(qrToken);
        registration = registrationRepository.save(registration);

        Event event = eventRepository.findById(registration.getEventId()).orElseThrow();
        User user = userRepository.findById(registration.getUserId()).orElseThrow();

        try {
            byte[] qrImage = qrService.generateQRCodeImage(qrToken);
            emailService.sendTicketEmail(user.getEmail(), user.getName(), event.getName(),
                    event.getStartTime(), event.getVenue(), qrImage);
        } catch (Exception e) {
            // non-fatal
        }

        return toResponse(registration, event);
    }

    public byte[] getTicketQR(Long registrationId, Long userId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + registrationId));

        if (!registration.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        if (registration.getQrToken() == null) {
            throw new IllegalArgumentException("QR code not yet generated. Complete payment first.");
        }

        return qrService.generateQRCodeImage(registration.getQrToken());
    }

    public List<RegistrationResponse> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId).stream()
                .map(r -> {
                    Event event = eventRepository.findById(r.getEventId()).orElse(null);
                    return toResponse(r, event);
                })
                .collect(Collectors.toList());
    }

    private RegistrationResponse toResponse(Registration r, Event event) {
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
    }
}
