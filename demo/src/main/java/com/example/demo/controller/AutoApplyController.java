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

    // --- Runtime State ---
    private volatile boolean isRunning = false;
    private volatile int processedJobs = 0;
    private volatile int successfulApplications = 0;
    private volatile String lastRunTime = null;

    // ✅ START AUTO APPLY
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

            String url = pythonServiceBase + "/auto-apply/run-once?limit=" + limit;

            // Run asynchronously
            new Thread(() -> {
                try {
                    System.out.println("🚀 Auto-apply started with limit=" + limit);
                    ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map<String, Object> body = response.getBody();
                        int processed = asInt(body.get("processed"));
                        int successful = asInt(body.get("successful"));

                        // Handle nested { result: { processed, successful } } structure
                        if ((processed == 0 && successful == 0) && body.containsKey("result")) {
                            Object resultObj = body.get("result");
                            if (resultObj instanceof Map<?, ?> result) {
                                processed = asInt(result.get("processed"));
                                successful = asInt(result.get("successful"));
                            }
                        }

                        processedJobs = processed;
                        successfulApplications = successful;

                        System.out.println("✅ Auto-apply completed:");
                        System.out.println("   Processed Jobs: " + processedJobs);
                        System.out.println("   Successful Applications: " + successfulApplications);
                    } else {
                        System.err.println("⚠️ Python service responded with non-200 status: " + response.getStatusCode());
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error during auto-apply: " + e.getMessage());
                } finally {
                    // ✅ Automatically stop when the run is finished
                    isRunning = false;
                    System.out.println("🛑 Auto-apply process ended automatically.");
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

    // ✅ GET STATUS (Frontend polls this every 5s)
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("isRunning", isRunning);
        status.put("processedJobs", processedJobs);
        status.put("successfulApplications", successfulApplications);
        status.put("lastRunTime", lastRunTime);
        return ResponseEntity.ok(status);
    }

    // ✅ RECEIVE PROGRESS UPDATES (from Python)
    @PostMapping("/update-progress")
    public ResponseEntity<?> updateProgress(@RequestBody Map<String, Object> progress) {
        try {
            if (progress.containsKey("processed")) {
                processedJobs = asInt(progress.get("processed"));
            }
            if (progress.containsKey("successful")) {
                successfulApplications = asInt(progress.get("successful"));
            }
            return ResponseEntity.ok("Progress updated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error updating progress: " + e.getMessage());
        }
    }

    // ✅ STOP AUTO APPLY (manual stop)
    @PostMapping("/stop")
    public ResponseEntity<?> stopAutoApply() {
        if (!isRunning) {
            return ResponseEntity.badRequest().body("Auto-apply is not running");
        }

        isRunning = false;
        System.out.println("🧩 Manual stop requested for auto-apply.");
        return ResponseEntity.ok("Auto-apply stop requested");
    }

    // -------------- Helpers --------------
    private int asInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try { return Integer.parseInt((String) value); } catch (Exception ignored) {}
        }
        return 0;
    }
}
