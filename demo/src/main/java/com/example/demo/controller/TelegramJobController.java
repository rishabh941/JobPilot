package com.example.demo.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/telegram")
public class TelegramJobController {

    @PostMapping("/job")
    public ResponseEntity<String> receiveJob(@RequestBody Map<String, Object> jobData) {
        System.out.println("🟢 Received job from Telegram Bot: " + jobData);
        
        return ResponseEntity.ok("Received");
    }
}
