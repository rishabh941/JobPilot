package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;


import java.time.LocalDateTime;

@Entity
@Table(name = "jobs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"jobHash"})
})

public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    private String title;
    private String url;
    private String location;
    private String company;
    private String experience;
    private LocalDateTime postedAt;
    private String jobHash;
    private String skills;
    private String jobType;
    private String seniorityLevel;
    private String source;
    private String posted; 
    private String jobCategory;
    // private Integer salary;
    // private Integer openings;
    // private Integer applicants;
    

    @PrePersist
    public void onCreate(){
        if(this.postedAt == null){
            this.postedAt = LocalDateTime.now();
        }
    }
    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public String getJobHash() {
        return jobHash;
    }

    public void setJobHash(String jobHash) {
        this.jobHash = jobHash;
    }

    // Getters and Setters for additional fields

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getSeniorityLevel() {
        return seniorityLevel;
    }

    public void setSeniorityLevel(String seniorityLevel) {
        this.seniorityLevel = seniorityLevel;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getPosted() {
        return posted;
    }

    public void setPosted(String posted) {
        this.posted = posted;
    }
    
    public String getJobCategory() {
        return jobCategory;
    }

    public void setJobCategory(String jobCategory) {
        this.jobCategory = jobCategory;
    }

    // public Integer getSalary() {
    //     return salary;
    // }
    // public void setSalary(Integer salary) {
    //     this.salary = salary;
    // }
    // public Integer getOpenings() {
    //     return openings;
    // }
    // public void setOpenings(Integer openings) {
    //     this.openings = openings;
    // }
    // public Integer getApplicants() {
    //     return applicants;
    // }
    // public void setApplicants(Integer applicants) {
    //     this.applicants = applicants;
    // }

}
