package com.example.collegeEventManagmenet.entity;

import com.example.collegeEventManagmenet.enums.EventCategory;
import com.example.collegeEventManagmenet.enums.EventStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private EventCategory category;

    private String venue;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal price;
    private Integer totalSeats;

    @Builder.Default
    private Integer registeredCount = 0;

    @Builder.Default
    private Integer checkedInCount = 0;

    private Long createdBy;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private LocalDateTime registrationDeadline;
    private LocalDateTime createdAt;
}
