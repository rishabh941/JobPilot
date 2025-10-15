package com.example.demo.service;

import com.example.demo.model.Job;

import org.springframework.stereotype.Service;

@Service
public class JobNormalizerService {

    public String normalizeExperience(String exp) {
        if (exp == null || exp.isBlank()) return "Not specified";
        return exp.toLowerCase()
                  .replaceAll("[^0-9\\-– ]", "")
                  .replace("–", "-")
                  .trim();
    }

    // Normalize text fields
    public Job normalize(Job job) {
        if (job.getTitle() != null) job.setTitle(job.getTitle().trim().toLowerCase());
        if (job.getCompany() != null) job.setCompany(job.getCompany().trim().toLowerCase());
        if (job.getLocation() != null) job.setLocation(job.getLocation().trim().toLowerCase());
        if (job.getExperience() != null) job.setExperience(normalizeExperience(job.getExperience()));
        return job;
    }
}
