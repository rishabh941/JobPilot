package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/autoapply")
@CrossOrigin(origins = "*")
public class AutoApplyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${python.service.base:http://127.0.0.1:5000}")
    private String pythonServiceBase;
    
    private volatile boolean isRunning = false;
    private volatile int processedJobs = 0;
    private volatile int successfulApplications = 0;
    private volatile String lastRunTime = null;

    @PostMapping("/start")
    public ResponseEntity<?> startAutoApply(@RequestParam(defaultValue = "10") int limit) {
        if (isRunning) {
            return ResponseEntity.badRequest().body("Auto-apply is already running");
        }

        try {
            isRunning = true;
            processedJobs = 0;
            successfulApplications = 0;
            lastRunTime = java.time.LocalDateTime.now().toString();

            // Call Python FastAPI service
            // Use the FastAPI synchronous endpoint for one-off runs
            String url = pythonServiceBase + "/auto-apply/run-once?limit=" + limit;
            
            // Start in a separate thread to avoid blocking
            new Thread(() -> {
                try {
                    ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map<String, Object> result = response.getBody();
                        processedJobs = (Integer) result.getOrDefault("processed", 0);
                        successfulApplications = (Integer) result.getOrDefault("successful", 0);
                    }
                } catch (Exception e) {
                    System.err.println("Error in auto-apply: " + e.getMessage());
                } finally {
                    isRunning = false;
                }
            }).start();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Auto-apply started successfully");
            response.put("limit", limit);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            isRunning = false;
            return ResponseEntity.internalServerError()
                    .body("Error starting auto-apply: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("isRunning", isRunning);
        status.put("processedJobs", processedJobs);
        status.put("successfulApplications", successfulApplications);
        status.put("lastRunTime", lastRunTime);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopAutoApply() {
        if (!isRunning) {
            return ResponseEntity.badRequest().body("Auto-apply is not running");
        }
        
        // Note: This is a soft stop - the current job will complete
        isRunning = false;
        return ResponseEntity.ok("Auto-apply stop requested");
    }
}