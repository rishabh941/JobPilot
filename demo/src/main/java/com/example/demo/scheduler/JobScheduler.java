package com.example.demo.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.example.demo.service.JobService;

@Component  
public class JobScheduler {

    @Autowired
    private JobService jobService;

    @Scheduled(cron = "0 0 9 * * ?")  // Every day at 9 AM
    public void runDailyJobSearch() {
        System.out.println("🕘 Running daily job scrape for Software Engineer in Bangalore...");
        try {
            jobService.scrapeJobs("Software Engineer", "Bangalore");
            System.out.println("✅ Daily Job Scraping Triggered Successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error during scheduled scraping: " + e.getMessage());
        }
    }
}
