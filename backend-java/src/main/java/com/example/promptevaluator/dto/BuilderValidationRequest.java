package com.example.promptevaluator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BuilderValidationRequest(
        @NotBlank @Size(max = 2000) String role,
        @NotBlank @Size(max = 2000) String task,
        @Size(max = 5000) String context,
        @Size(max = 20) List<String> constraints,
        @Size(max = 1000) String outputFormat,
        List<Example> examples,
        String targetModel,
        @Pattern(regexp = "reasoning|extraction|classification|creative|other") String taskNature,
        @NotBlank @Pattern(regexp = "plaintext|markdown|json|xml|yaml") String chosenFormat
) {
    public record Example(String input, String output) {}
}