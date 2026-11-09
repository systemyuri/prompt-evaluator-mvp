package com.example.promptevaluator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FreeValidationRequest(
        @NotBlank @Size(min = 10, max = 20000) String promptText,
        String targetModel,
        @Pattern(regexp = "reasoning|extraction|classification|creative|other") String taskNature
) {}