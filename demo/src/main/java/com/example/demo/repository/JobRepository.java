package com.example.demo.repository;

import java.util.List;
import java.util.Optional;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Job;

public interface JobRepository extends MongoRepository<Job, String> {

    Optional<Job> findByJobHash(String jobHash);
    List<Job> findByStatusIsNullOrStatus(String status);
}
