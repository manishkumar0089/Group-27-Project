package com.example.collegeEventManagmenet.controller;

import com.example.collegeEventManagmenet.dto.PaymentVerifyRequest;
import com.example.collegeEventManagmenet.dto.RegistrationRequest;
import com.example.collegeEventManagmenet.dto.RegistrationResponse;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/api/registrations")
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(registrationService.registerForEvent(user.getId(), request.getEventId()));
    }

    @PostMapping("/api/payment/verify")
    public ResponseEntity<RegistrationResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request,
                                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(registrationService.verifyPayment(request.getRegistrationId(), request.getTxnId()));
    }

    @GetMapping(value = "/api/registrations/{id}/ticket", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTicket(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        byte[] qrImage = registrationService.getTicketQR(id, user.getId());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }

    @GetMapping("/api/registrations/my")
    public ResponseEntity<List<RegistrationResponse>> myRegistrations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(user.getId()));
    }
}
