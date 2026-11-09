
package com.example.promptevaluator.dto;

import java.util.List;
import java.util.Map;

public record ValidationResponse(
        int overallScore,
        String grade,
        String detectedFormat,
        Map<String, Integer> categoryScores,
        Map<String, Object> estimatedTokens,
        List<Finding> findings,
        Map<String, Object> formatRecommendation,
        String assembledPrompt
) {}