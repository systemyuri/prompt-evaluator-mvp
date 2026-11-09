
package com.example.promptevaluator.controller;

import com.example.promptevaluator.dto.BuilderValidationRequest;
import com.example.promptevaluator.dto.ValidationResponse;
import com.example.promptevaluator.service.PythonValidatorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/builder")
public class BuilderValidationController {

    private final PythonValidatorService service;

    public BuilderValidationController(PythonValidatorService service) {
        this.service = service;
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidationResponse> validate(@Valid @RequestBody BuilderValidationRequest req) {
        ValidationResponse response = service.validateBuilder(req).block();
        return ResponseEntity.ok(response);
    }
}