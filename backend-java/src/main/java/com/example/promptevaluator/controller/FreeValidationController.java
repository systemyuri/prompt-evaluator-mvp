package com.example.promptevaluator.controller;

import com.example.promptevaluator.dto.FreeValidationRequest;
import com.example.promptevaluator.dto.ValidationResponse;
import com.example.promptevaluator.service.PythonValidatorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/validator")
public class FreeValidationController {

    private final PythonValidatorService service;

    public FreeValidationController(PythonValidatorService service) {
        this.service = service;
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidationResponse> validate(@Valid @RequestBody FreeValidationRequest req) {
        ValidationResponse response = service.validateFree(req).block();
        return ResponseEntity.ok(response);
    }
}