package com.example.collegeEventManagmenet.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRService {

    @Value("${app.qr.secret}")
    private String qrSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateQRToken(Long registrationId, Long eventId, Long userId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("registrationId", registrationId);
            payload.put("eventId", eventId);
            payload.put("userId", userId);
            payload.put("issuedAt", System.currentTimeMillis());

            String payloadJson = objectMapper.writeValueAsString(payload);
            String payloadBase64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            String signature = hmacSha256(payloadBase64, qrSecret);
            return payloadBase64 + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR token", e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyAndDecodeToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                throw new IllegalArgumentException("Invalid QR token format");
            }
            String payloadBase64 = parts[0];
            String signature = parts[1];

            String expectedSignature = hmacSha256(payloadBase64, qrSecret);
            if (!expectedSignature.equals(signature)) {
                throw new IllegalArgumentException("Invalid QR token signature");
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(payloadBase64), StandardCharsets.UTF_8);
            return objectMapper.readValue(payloadJson, Map.class);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode QR token", e);
        }
    }

    public byte[] generateQRCodeImage(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 300, 300, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
    }
}