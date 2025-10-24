package com.example.demo.service;

import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.dto.JobResponse;
import com.example.demo.model.Job;
import com.example.demo.repository.JobRepository;

@Service
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobNormalizerService jobNormalizerService;

    @Autowired
    private JobCategoryService jobCategoryService;

    @Autowired
    private JobClassifier jobClassifier;

    @Value("${jobpilot.scraper.base-url:http://localhost:5000/scrape-jobs}")
    private String fastApiBaseUrl;

    /**
     * 🟢 Scrapes jobs from FastAPI microservice and safely saves unique ones.
     */
    public List<Job> scrapeJobs(String role, String location, String experienceFilter, String posted, int pages) {
        RestTemplate restTemplate = new RestTemplate();

        // ✅ Build encoded URL safely (handles spaces and special characters)
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(fastApiBaseUrl)
                .queryParam("role", role)
                .queryParam("location", location);

        if (experienceFilter != null && !experienceFilter.isEmpty() && !"all".equalsIgnoreCase(experienceFilter)) {
            uriBuilder.queryParam("experience_filter", experienceFilter);
        }
        if (posted != null && !posted.isEmpty() && !"any".equalsIgnoreCase(posted)) {
            uriBuilder.queryParam("posted", posted);
        }
        int pagesToUse = Math.max(1, pages);
        uriBuilder.queryParam("pages", pagesToUse);

    // Build and encode the URI (auto-encodes spaces and special chars)
    String url = uriBuilder.build().encode().toUriString();
        logger.info("📡 Fetching jobs from scraper API: {}", url);

        JobResponse response;
        try {
            response = restTemplate.getForObject(url, JobResponse.class);
        } catch (Exception e) {
            logger.error("❌ Failed to fetch jobs from scraper API: {}", e.getMessage());
            return List.of();
        }

        if (response == null || response.getJobs() == null) {
            logger.warn("⚠️ No jobs received from scraper API.");
            return List.of();
        }

        List<Job> scrapedJobs = response.getJobs();
        List<Job> savedJobs = new ArrayList<>();

        for (Job job : scrapedJobs) {
            try {
                // Normalize & enrich job data
                Job normalizedJob = jobNormalizerService.normalize(job);
                jobClassifier.classify(normalizedJob);
                jobCategoryService.enrichJob(normalizedJob);

                // Generate unique hash for deduplication
                normalizedJob.setJobHash(generateJobHash(
                        normalizedJob.getTitle(),
                        normalizedJob.getCompany(),
                        normalizedJob.getLocation()
                ));

                normalizedJob.setStatus("pending");
                normalizedJob.setAppliedAt(null);

                // 🧠 Safe save with deduplication
                Job savedJob = saveJobSafely(normalizedJob);
                if (savedJob != null) {
                    savedJobs.add(savedJob);
                }

            } catch (Exception e) {
                logger.error("❌ Error processing job '{}': {}", job.getTitle(), e.getMessage());
            }
        }

        logger.info("💾 Total new jobs saved: {}", savedJobs.size());
        return savedJobs;
    }

    /**
     * 🧩 Safely saves a job — handles DB constraint exceptions gracefully.
     */
    private Job saveJobSafely(Job job) {
        try {
            // Pre-check to skip duplicates
            Optional<Job> existing = jobRepository.findByJobHash(job.getJobHash());
            if (existing.isPresent()) {
                logger.warn("⚠️ Duplicate found before save: {} at {}", job.getTitle(), job.getCompany());
                return existing.get();
            }

            Job saved = jobRepository.save(job);
            logger.info("✅ Saved new job: {} at {}", job.getTitle(), job.getCompany());
            return saved;

        } catch (DataIntegrityViolationException e) {
            // If another process already inserted same job
            logger.warn("⚠️ Duplicate detected during save (DB constraint): {}", job.getTitle());
            return jobRepository.findByJobHash(job.getJobHash()).orElse(null);
        } catch (Exception e) {
            logger.error("❌ Unexpected error while saving job '{}': {}", job.getTitle(), e.getMessage());
            return null;
        }
    }

    /**
     * 🧠 Deterministic MD5 hash generator for deduplication
     */
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

    /**
     * 🟢 Add a job manually (from controller)
     */
    public Job saveJob(Job job) {
        try {
            Job normalizedJob = jobNormalizerService.normalize(job);
            jobCategoryService.enrichJob(normalizedJob);
            normalizedJob.setJobHash(generateJobHash(
                    normalizedJob.getTitle(),
                    normalizedJob.getCompany(),
                    normalizedJob.getLocation()
            ));
            normalizedJob.setStatus("pending");
            normalizedJob.setAppliedAt(null);

            return saveJobSafely(normalizedJob);

        } catch (Exception e) {
            logger.error("❌ Error manually adding job '{}': {}", job.getTitle(), e.getMessage());
            return null;
        }
    }

    /**
     * 🟢 Fetch all jobs from DB
     */
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}
