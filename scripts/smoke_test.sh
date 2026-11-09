#!/usr/bin/env bash
set -euo pipefail

echo "▶ 1/4 Health check Python..."
curl -fsS http://localhost:8000/health | jq .

echo "▶ 2/4 Health check Java..."
curl -fsS http://localhost:8080/actuator/health | jq .

echo "▶ 3/4 Validación MVP-02 (free)..."
curl -fsS -X POST http://localhost:8080/api/v1/validator/validate \
  -H "Content-Type: application/json" \
  -d '{"promptText":"Eres un asistente útil. Responde de forma concisa pero proporciona explicaciones detalladas.","targetModel":"gpt-4o-mini","taskNature":"reasoning"}' | jq '{overallScore, grade, detectedFormat}'

echo "▶ 4/4 Validación MVP-01 (builder)..."
curl -fsS -X POST http://localhost:8080/api/v1/builder/validate \
  -H "Content-Type: application/json" \
  -d '{"role":"Eres un analista financiero senior","task":"Clasifica el siguiente ticket de soporte en una categoría","context":"El ticket proviene de un cliente empresarial","constraints":["No inventes categorías","Si es ambiguo usa unknown"],"outputFormat":"Devuelve un JSON con las claves category, urgency y summary","chosenFormat":"markdown","targetModel":"gpt-4o-mini","taskNature":"classification"}' | jq '{overallScore, grade, estimatedTokens}'

echo "✅ Smoke test OK"