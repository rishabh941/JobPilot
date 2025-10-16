package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Job;

@Service
public class JobClassifier {

     // Keywords for category detection
    private static final List<String> FRONTEND_KEYWORDS = List.of("react", "angular", "vue", "javascript", "typescript", "frontend", "html", "css");
    private static final List<String> BACKEND_KEYWORDS = List.of("java", "spring", "node", "express", "django", "flask", "backend", "api");
    private static final List<String> DATA_KEYWORDS = List.of("data", "ml", "ai", "machine learning", "deep learning", "python", "pandas", "numpy");
    private static final List<String> DEVOPS_KEYWORDS = List.of("aws", "docker", "kubernetes", "jenkins", "terraform", "azure", "ci/cd");
    private static final List<String> MOBILE_KEYWORDS = List.of("android", "flutter", "react native", "ios");
    private static final List<String> TESTING_KEYWORDS = List.of("qa", "test", "selenium", "automation", "manual testing");

    public void classify(Job job) {
        String text = (job.getTitle() + " " + job.getSkills()).toLowerCase();

        if (text.contains("intern"))
            job.setJobCategory("Internship");
        else if (containsAny(text, FRONTEND_KEYWORDS))
            job.setJobCategory("Frontend Development");
        else if (containsAny(text, BACKEND_KEYWORDS))
            job.setJobCategory("Backend Development");
        else if (containsAny(text, DATA_KEYWORDS))
            job.setJobCategory("Data Science / ML");
        else if (containsAny(text, DEVOPS_KEYWORDS))
            job.setJobCategory("DevOps / Cloud");
        else if (containsAny(text, MOBILE_KEYWORDS))
            job.setJobCategory("Mobile Development");
        else if (containsAny(text, TESTING_KEYWORDS))
            job.setJobCategory("QA / Testing");
        else
            job.setJobCategory("General Tech"); // fallback
    }

    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}
