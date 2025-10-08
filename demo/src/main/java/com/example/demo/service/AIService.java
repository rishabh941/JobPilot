
package com.example.demo.service;

import org.springframework.web.reactive.function.client.WebClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.config.OpenAIConfig;

@Service
public class AIService {

    @Autowired
    private OpenAIConfig openAIConfig;

    public String generateEmail(String hrName, String company, String role) {
        String prompt = "Write a professional cold email to " + hrName +
                        " at " + company + " for the " + role + " position.";

        WebClient client = WebClient.builder()
            .baseUrl("https://api.openai.com/v1/chat/completions")
            .defaultHeader("Authorization", "Bearer " + openAIConfig.getApiKey())
            .build();

        String response = client.post()
            .bodyValue("""
                {
                  "model": "gpt-3.5-turbo",
                  "messages": [{"role": "user", "content": "%s"}]
                }
            """.formatted(prompt))
            .retrieve()
            .bodyToMono(String.class)
            .block();

        return response;
    }

}
