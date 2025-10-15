package com.example.demo.service;

import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.model.Job;
import com.example.demo.repository.JobRepository;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobNormalizerService jobNormalizerService;

    @Autowired
    private JobCategoryService jobCategoryService;

    // 🟢 Fetch jobs from FastAPI and save unique ones
    public List<Job> scrapeJobs(String role, String location) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:5000/scrape-jobs?role=" + role + "&location=" + location;
        System.out.println("Fetching jobs from: " + url);

        Job[] jobs = restTemplate.getForObject(url, Job[].class);

        if (jobs == null || jobs.length == 0) {
            System.out.println("No jobs found from the scraping service.");
            return List.of();
        }

        List<Job> savedJobs = new ArrayList<>();
        for (Job job : jobs) {
            Job normalizedJob = jobNormalizerService.normalize(job);
            jobCategoryService.enrichJob(normalizedJob);
            normalizedJob.setJobHash(generateJobHash(
                normalizedJob.getTitle(),
                normalizedJob.getCompany(),
                normalizedJob.getLocation()
            ));

            Optional<Job> existingJob = jobRepository.findByJobHash(normalizedJob.getJobHash());
            if (existingJob.isPresent()) {
                System.out.println("⚠️ Skipping duplicate: " + normalizedJob.getTitle() + " at " + normalizedJob.getCompany());
                continue;
            }

            Job savedJob = jobRepository.save(normalizedJob);
            savedJobs.add(savedJob);
            System.out.println("✅ Saved new job: " + savedJob.getTitle() + " at " + savedJob.getCompany());
        }

        System.out.println("💾 Total new jobs saved: " + savedJobs.size());
        return savedJobs;
    }

    // 🟢 Manually add a single job (used by /api/jobs/add)
    public Job saveJob(Job job) {
        Job normalizedJob = jobNormalizerService.normalize(job);
        jobCategoryService.enrichJob(normalizedJob);
        normalizedJob.setJobHash(generateJobHash(
            normalizedJob.getTitle(),
            normalizedJob.getCompany(),
            normalizedJob.getLocation()
        ));

        Optional<Job> existingJob = jobRepository.findByJobHash(normalizedJob.getJobHash());
        if (existingJob.isPresent()) {
            System.out.println("⚠️ Duplicate job detected: " + normalizedJob.getTitle() + " at " + normalizedJob.getCompany());
            return existingJob.get();
        }

        Job savedJob = jobRepository.save(normalizedJob);
        System.out.println("✅ Manually added job: " + savedJob.getTitle() + " at " + savedJob.getCompany());
        return savedJob;
    }

    // 🔐 Hash generator
    private String generateJobHash(String title, String company, String location) {
        try {
            String raw = (title + "|" + company + "|" + location).toLowerCase().trim();
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(raw.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating job hash", e);
        }
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}
