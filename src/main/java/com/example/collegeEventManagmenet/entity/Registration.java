package com.example.collegeEventManagmenet.entity;

import com.example.collegeEventManagmenet.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long eventId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String paymentTxnId;

    @Column(unique = true)
    private String qrToken;

    @Builder.Default
    private boolean checkedIn = false;

    private LocalDateTime checkedInAt;
    private Long checkedInBy;
    private LocalDateTime registeredAt;
}