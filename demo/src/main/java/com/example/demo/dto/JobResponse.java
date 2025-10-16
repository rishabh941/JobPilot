package com.example.demo.dto;

import com.example.demo.model.Job;
import java.util.List;

public class JobResponse {

    private List<Job> jobs;

    public List<Job> getJobs() {
        return jobs;
    }

    public void setJobs(List<Job> jobs) {
        this.jobs = jobs;
    }
}
