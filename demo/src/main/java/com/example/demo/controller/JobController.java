package com.example.demo.controller;

import com.example.demo.model.Job;
import com.example.demo.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    // 1️⃣ Trigger scraping
    @GetMapping("/scrape")
    public ResponseEntity<?> scrapeJobs(
            @RequestParam String role,
            @RequestParam String location
    ) {
        try {
            System.out.println("🚀 Triggering job scrape for role=" + role + ", location=" + location);
            List<Job> savedJobs = jobService.scrapeJobs(role, location);
            if (savedJobs.isEmpty()) {
                return ResponseEntity.ok("⚠️ No new jobs found for " + role + " in " + location);
            }
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("❌ Error while scraping jobs: " + e.getMessage());
        }
    }

    // 2️⃣ Add a job manually
    @PostMapping("/add")
    public ResponseEntity<Job> addJob(@RequestBody Job job) {
        Job saved = jobService.saveJob(job);
        return ResponseEntity.ok(saved);
    }

    // 3️⃣ Get all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        System.out.println("📋 Fetching all jobs from database...");
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    // 4️⃣ Search by title/company
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company
    ) {
        System.out.println("🔍 Searching jobs: title=" + title + ", company=" + company);
        List<Job> allJobs = jobService.getAllJobs();
        List<Job> filtered = allJobs.stream()
                .filter(j -> (title == null || j.getTitle().contains(title.toLowerCase())) &&
                             (company == null || j.getCompany().contains(company.toLowerCase())))
                .toList();
        return ResponseEntity.ok(filtered);
    }
}
