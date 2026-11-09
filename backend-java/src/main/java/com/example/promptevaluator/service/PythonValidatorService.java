package com.example.promptevaluator.service;

import com.example.promptevaluator.dto.BuilderValidationRequest;
import com.example.promptevaluator.dto.FreeValidationRequest;
import com.example.promptevaluator.dto.ValidationResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class PythonValidatorService {

    private final WebClient client;

    public PythonValidatorService(WebClient pythonWebClient) {
        this.client = pythonWebClient;
    }

    public Mono<ValidationResponse> validateBuilder(BuilderValidationRequest req) {
        return client.post()
                .uri("/validate/builder")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(ValidationResponse.class);
    }

    public Mono<ValidationResponse> validateFree(FreeValidationRequest req) {
        return client.post()
                .uri("/validate/free")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(ValidationResponse.class);
    }
}