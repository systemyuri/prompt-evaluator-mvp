package com.example.promptevaluator.dto;

public record Finding(
        String ruleId,
        String severity,
        Integer line,
        String message,
        String suggestion,
        String source
) {}