package com.example.demo.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

import com.example.demo.service.JobService;

public class JobScheduler {

     @Autowired
    private JobService jobService;

    @Scheduled(cron = "0 0 9 * * ?")  // Every day at 9 AM
    public void runDailyJobSearch() {
        jobService.scrapeJobs("Software Engineer", "Bangalore");
        System.out.println("✅ Daily Job Scraping Triggered!");
    }
}
