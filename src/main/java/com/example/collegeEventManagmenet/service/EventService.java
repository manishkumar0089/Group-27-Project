package com.example.collegeEventManagmenet.service;

import com.example.collegeEventManagmenet.dto.EventRequest;
import com.example.collegeEventManagmenet.dto.EventResponse;
import com.example.collegeEventManagmenet.entity.Event;
import com.example.collegeEventManagmenet.enums.EventStatus;
import com.example.collegeEventManagmenet.exception.ResourceNotFoundException;
import com.example.collegeEventManagmenet.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public EventResponse createEvent(EventRequest request, Long adminId) {
        Event event = Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .venue(request.getVenue())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .price(request.getPrice())
                .totalSeats(request.getTotalSeats())
                .registeredCount(0)
                .checkedInCount(0)
                .createdBy(adminId)
                .status(EventStatus.OPEN)
                .registrationDeadline(request.getRegistrationDeadline())
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(eventRepository.save(event));
    }

    public List<EventResponse> getAllOpenEvents() {
        return eventRepository.findByStatus(EventStatus.OPEN).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return toResponse(event);
    }

    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setPrice(request.getPrice());
        event.setTotalSeats(request.getTotalSeats());
        event.setRegistrationDeadline(request.getRegistrationDeadline());

        return toResponse(eventRepository.save(event));
    }

    public void closeEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        event.setStatus(EventStatus.CLOSED);
        eventRepository.save(event);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private EventResponse toResponse(Event event) {
        int available = event.getTotalSeats() - event.getRegisteredCount();
        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .category(event.getCategory())
                .venue(event.getVenue())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .price(event.getPrice())
                .totalSeats(event.getTotalSeats())
                .registeredCount(event.getRegisteredCount())
                .checkedInCount(event.getCheckedInCount())
                .createdBy(event.getCreatedBy())
                .status(event.getStatus())
                .registrationDeadline(event.getRegistrationDeadline())
                .createdAt(event.getCreatedAt())
                .availableSeats(Math.max(0, available))
                .build();
    }
}
