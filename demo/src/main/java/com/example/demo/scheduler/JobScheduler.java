package com.example.demo.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.example.demo.service.JobService;

@Component
public class JobScheduler {

    @Autowired
    private JobService jobService;

    /**
     * ⏰ Runs every day at 9 AM (cron format: second minute hour day month weekday)
     * 0 0 9 * * ? → every day at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void runDailyJobSearch() {
        // You can make these dynamic later via application.yml or DB config
        String role = "Software Engineer";
        String location = "Bangalore";
        String experienceFilter = "0-1";  // Filter fresher / entry-level roles
        String posted = "7days";          // Only fetch jobs from last 7 days
        int pages = 3;                    // Number of pages to scrape per run

        System.out.println("🕘 [Scheduler] Starting automated job scrape...");
        System.out.println("🔍 Role: " + role + ", Location: " + location +
                           ", Experience: " + experienceFilter + ", Posted: " + posted);

        try {
            // Call the updated JobService method
            jobService.scrapeJobs(role, location, experienceFilter, posted, pages);
            System.out.println("✅ [Scheduler] Daily Job Scraping Completed Successfully!");
        } catch (Exception e) {
            System.err.println("❌ [Scheduler] Error during scheduled scraping: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
