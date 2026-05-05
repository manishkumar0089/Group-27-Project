package com.example.collegeEventManagmenet.controller;

import com.example.collegeEventManagmenet.dto.AdminStatsResponse;
import com.example.collegeEventManagmenet.dto.RegistrationResponse;
import com.example.collegeEventManagmenet.dto.VolunteerCreateRequest;
import com.example.collegeEventManagmenet.entity.User;
import com.example.collegeEventManagmenet.service.AdminService;
import com.example.collegeEventManagmenet.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CheckInService checkInService;

    @GetMapping("/events/{id}/stats")
    public ResponseEntity<AdminStatsResponse> getStats(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getEventStats(id));
    }

    @GetMapping("/events/{id}/export")
    public ResponseEntity<byte[]> exportData(@PathVariable Long id) {
        byte[] data = adminService.exportEventData(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event_" + id + "_registrations.csv\"")
                .body(data);
    }

    @PostMapping("/volunteers")
    public ResponseEntity<Map<String, Object>> createVolunteer(@Valid @RequestBody VolunteerCreateRequest request,
                                                                @AuthenticationPrincipal User admin) {
        var result = adminService.createVolunteer(request, admin.getId());
        return ResponseEntity.ok(Map.of(
                "id", result.volunteer().getId(),
                "name", result.volunteer().getName(),
                "email", result.volunteer().getEmail(),
                "assignedEventId", result.volunteer().getAssignedEventId(),
                "password", result.rawPassword()
        ));
    }

    @GetMapping("/events/{id}/checkin-feed")
    public ResponseEntity<List<RegistrationResponse>> getCheckInFeed(@PathVariable Long id) {
        return ResponseEntity.ok(checkInService.getRecentCheckIns(id));
    }

    @GetMapping("/events/{id}/volunteers")
    public ResponseEntity<List<Map<String, Object>>> getVolunteersForEvent(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getVolunteersWithPasswordsByEvent(id));
    }
}
