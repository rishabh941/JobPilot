package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailController {

    @GetMapping("/sendEmail")
    public String sendEmail() {
        return "Email sent!";
    }
}
