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

    // 🟢 1️⃣ Trigger scraping with optional filters
    @GetMapping("/scrape")
    public ResponseEntity<?> scrapeJobs(
            @RequestParam String role,
            @RequestParam String location,
            @RequestParam(required = false, name = "experience_filter") String experienceFilter,
            @RequestParam(required = false) String posted,
            @RequestParam(defaultValue = "1") int pages
    ) {
        try {
            System.out.println("🚀 Triggering job scrape for role=" + role + ", location=" + location +
                               ", expFilter=" + experienceFilter + ", posted=" + posted + ", pages=" + pages);

            List<Job> savedJobs = jobService.scrapeJobs(role, location, experienceFilter, posted, pages);

            if (savedJobs.isEmpty()) {
                return ResponseEntity.ok("⚠️ No new jobs found for " + role + " in " + location);
            }

            System.out.println("✅ " + savedJobs.size() + " new jobs saved successfully!");
            return ResponseEntity.ok(savedJobs);

        } catch (Exception e) {
            System.err.println("❌ Error while scraping jobs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Error while scraping jobs: " + e.getMessage());
        }
    }

    // 🟢 2️⃣ Add a job manually
    @PostMapping("/add")
    public ResponseEntity<Job> addJob(@RequestBody Job job) {
        Job saved = jobService.saveJob(job);
        return ResponseEntity.ok(saved);
    }

    // 🟢 3️⃣ Get all saved jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        System.out.println("📋 Fetching all jobs from database...");
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    // 🟢 4️⃣ Search by title or company (case-insensitive)
    // 4️⃣ Filter jobs by type, seniority, and location (without min/max exp)
    @GetMapping("/filter")
    public ResponseEntity<List<Job>> filterJobs(
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String seniorityLevel,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String title
    ) {
        System.out.println("🔍 Filtering jobs...");

        List<Job> jobs = jobService.getAllJobs();

        List<Job> filtered = jobs.stream()
                .filter(j -> (jobType == null || j.getJobType().equalsIgnoreCase(jobType)))
                .filter(j -> (seniorityLevel == null || j.getSeniorityLevel().equalsIgnoreCase(seniorityLevel)))
                .filter(j -> (location == null || j.getLocation().toLowerCase().contains(location.toLowerCase())))
                .filter(j -> (company == null || j.getCompany().toLowerCase().contains(company.toLowerCase())))
                .filter(j -> (title == null || j.getTitle().toLowerCase().contains(title.toLowerCase())))
                .toList();

        System.out.println("✅ Filtered Jobs Count: " + filtered.size());
        return ResponseEntity.ok(filtered);
    }
}
