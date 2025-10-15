package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;

import com.example.demo.model.Job;
import com.example.demo.repository.JobRepository;

public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public List<Job> scrapeJobs(String role, String location) {
        // Dummy implementation for job scraping
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:5000/scrape-jobs?role=" + role + "&location=" + location;

        Job[] jobs = restTemplate.getForObject(url, Job[].class);
        return jobRepository.saveAll(List.of(jobs));
    }
}
