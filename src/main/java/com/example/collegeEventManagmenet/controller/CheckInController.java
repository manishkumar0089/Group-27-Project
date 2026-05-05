package com.example.collegeEventManagmenet.controller;

import com.example.collegeEventManagmenet.dto.CheckInRequest;
import com.example.collegeEventManagmenet.dto.CheckInResponse;
import com.example.collegeEventManagmenet.dto.RegistrationResponse;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/scan")
    public ResponseEntity<CheckInResponse> scan(@Valid @RequestBody CheckInRequest request,
                                                 @AuthenticationPrincipal User user) {
        Long assignedEventId = user.getAssignedEventId();
        return ResponseEntity.ok(checkInService.scanQR(request.getQrToken(), user.getId(), assignedEventId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RegistrationResponse>> search(@RequestParam String query,
                                                              @RequestParam Long eventId) {
        return ResponseEntity.ok(checkInService.searchAttendee(query, eventId));
    }

    @PostMapping("/manual/{registrationId}")
    public ResponseEntity<CheckInResponse> manualCheckIn(@PathVariable Long registrationId,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(checkInService.manualCheckIn(registrationId, user.getId()));
    }
}
