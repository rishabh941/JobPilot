package com.example.demo.service;

import com.example.demo.model.Job;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobCategoryService {

    // Common tech stack keywords
    private static final List<String> SKILLS = List.of(
        "java", "python", "react", "node", "spring boot", "sql", "mongodb", "aws",
        "javascript", "typescript", "docker", "kubernetes", "html", "css", "express",
        "c++", "c#", "next.js", "flutter", "android", "django", "flask", "git"
    );

    public void enrichJob(Job job) {
        if (job.getTitle() == null) return;
        String title = job.getTitle().toLowerCase();

        // 1️⃣ Detect skills
        Set<String> detectedSkills = SKILLS.stream()
                .filter(title::contains)
                .collect(Collectors.toSet());
        job.setSkills(String.join(", ", detectedSkills));

        // 2️⃣ Detect job type
        if (title.contains("intern") || title.contains("internship"))
            job.setJobType("Internship");
        else if (title.contains("contract"))
            job.setJobType("Contract");
        else if (title.contains("remote"))
            job.setJobType("Remote");
        else
            job.setJobType("Full-time");

        // 3️⃣ Detect seniority
        if (title.contains("senior") || title.contains("lead"))
            job.setSeniorityLevel("Senior");
        else if (title.contains("junior") || title.contains("fresher"))
            job.setSeniorityLevel("Junior");
        else
            job.setSeniorityLevel("Mid-level");

        // 4️⃣ Set source if not provided
        if (job.getSource() == null || job.getSource().isEmpty())
            job.setSource("Naukri"); // default for now
    }
}
