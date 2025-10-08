package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.EmailRecord;

public interface EmailRepository extends JpaRepository<EmailRecord, Long> {

}
