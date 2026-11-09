import logging

from app import format_advisor, format_detector
from app.linters import promptclarity_runner, promptdoctor_runner, promptqc_runner
from app.models import (
    BuilderRequest,
    CategoryScores,
    EstimatedTokens,
    Finding,
    FreeRequest,
    ValidationResponse,
)

logger = logging.getLogger(__name__)


# ------------------------- Ensamblado (MVP-01) -------------------------


def assemble(builder: BuilderRequest) -> str:
    parts = {
        "Rol": builder.role,
        "Tarea": builder.task,
        "Contexto": builder.context or "",
        "Restricciones": "\n".join(f"- {c}" for c in (builder.constraints or [])),
        "Formato de salida": builder.outputFormat or "",
        "Ejemplos": "\n".join(
            f"Entrada: {e.input}\nSalida: {e.output}" for e in (builder.examples or [])
        ),
    }
    parts = {k: v for k, v in parts.items() if v}

    if builder.chosenFormat == "markdown":
        return "\n\n".join(f"## {k}\n{v}" for k, v in parts.items())
    if builder.chosenFormat == "plaintext":
        return "\n\n".join(f"{k.upper()}: {v}" for k, v in parts.items())
    if builder.chosenFormat == "json":
        import json

        return json.dumps(
            {k.lower().replace(" ", "_"): v for k, v in parts.items()},
            ensure_ascii=False,
            indent=2,
        )
    if builder.chosenFormat == "xml":
        return "\n".join(
            f"<{k.lower().replace(' ', '_')}>{v}</{k.lower().replace(' ', '_')}>"
            for k, v in parts.items()
        )
    # yaml
    return "\n".join(
        f"{k.lower().replace(' ', '_')}: |\n  " + v.replace("\n", "\n  ")
        for k, v in parts.items()
    )


# ------------------------- Utilidades -------------------------


def _estimate_tokens(text: str) -> int:
    # Aproximación: ~4 caracteres por token (inglés mezclado con español).
    # Sustituible por tiktoken si se necesita precisión.
    return max(1, len(text) // 4)


def _grade(score: int) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"


def _deduplicate(findings: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for f in findings:
        key = (f.get("ruleId"), f.get("line"), f.get("message"))
        if key in seen:
            continue
        seen.add(key)
        out.append(f)
    return out


def _weighted_score(findings: list[dict], base_categories: dict) -> tuple[int, dict]:
    penalties = {"error": 10, "warning": 4, "info": 1}
    total_penalty = sum(penalties.get(f["severity"], 0) for f in findings)
    base = sum(base_categories.values()) / len(base_categories)
    overall = max(0, min(100, int(base - total_penalty)))
    return overall, base_categories


def _run_linters(text: str) -> tuple[list[dict], dict]:
    pd = promptdoctor_runner.run(text)
    pq_findings, pq_scores = promptqc_runner.run(text)
    pc = promptclarity_runner.run(text)
    return _deduplicate(pd + pq_findings + pc), pq_scores


# ------------------------- Entrypoints -------------------------


def validate_builder(req: BuilderRequest) -> ValidationResponse:
    assembled = assemble(req)
    logger.info("Builder: prompt ensamblado (%d chars)", len(assembled))

    raw_findings, categories = _run_linters(assembled)
    findings = [Finding(**f) for f in raw_findings]
    overall, cats = _weighted_score(raw_findings, categories)

    chosen_tokens = _estimate_tokens(assembled)
    baseline_tokens = _estimate_tokens(
        assemble(req.model_copy(update={"chosenFormat": "plaintext"}))
    )
    overhead = (
        round(((chosen_tokens - baseline_tokens) / baseline_tokens) * 100, 1)
        if baseline_tokens
        else 0.0
    )

    recommendation = format_advisor.recommend(
        target_model=req.targetModel,
        task_nature=req.taskNature,
        chosen_format=req.chosenFormat,
    )

    return ValidationResponse(
        overallScore=overall,
        grade=_grade(overall),
        detectedFormat=req.chosenFormat,
        categoryScores=CategoryScores(**cats),
        estimatedTokens=EstimatedTokens(
            chosenFormat=chosen_tokens,
            plainTextBaseline=baseline_tokens,
            overheadPercentage=overhead,
        ),
        findings=findings,
        formatRecommendation=recommendation,
        assembledPrompt=assembled,
    )


def validate_free(req: FreeRequest) -> ValidationResponse:
    detected = format_detector.detect_format(req.promptText)
    logger.info("Free: formato detectado=%s", detected)

    raw_findings, categories = _run_linters(req.promptText)
    findings = [Finding(**f) for f in raw_findings]
    overall, cats = _weighted_score(raw_findings, categories)

    chosen_tokens = _estimate_tokens(req.promptText)
    # baseline: eliminar estructura si es markdown/xml/yaml/json, aproximado por longitud
    import re

    baseline_text = (
        re.sub(r"[#*_`>\-]+", "", req.promptText)
        if detected != "plaintext"
        else req.promptText
    )
    baseline_tokens = _estimate_tokens(baseline_text)
    overhead = (
        round(((chosen_tokens - baseline_tokens) / baseline_tokens) * 100, 1)
        if baseline_tokens
        else 0.0
    )

    recommendation = format_advisor.recommend(
        target_model=req.targetModel,
        task_nature=req.taskNature,
        detected_format=detected,
    )

    return ValidationResponse(
        overallScore=overall,
        grade=_grade(overall),
        detectedFormat=detected,
        categoryScores=CategoryScores(**cats),
        estimatedTokens=EstimatedTokens(
            detectedFormat=chosen_tokens,
            plainTextBaseline=baseline_tokens,
            overheadPercentage=overhead,
        ),
        findings=findings,
        formatRecommendation=recommendation,
        assembledPrompt=None,
    )
