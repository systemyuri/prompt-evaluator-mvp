"""
Wrapper defensivo sobre promptqc (modo --fast).
"""

import logging

logger = logging.getLogger(__name__)

try:
    from promptqc import analyze  # type: ignore

    _AVAILABLE = True
except ImportError:
    _AVAILABLE = False
    logger.warning("promptqc no disponible. Se omite su ejecución.")


def run(text: str) -> tuple[list[dict], dict]:
    """
    Devuelve (findings, category_scores). Si falla, findings vacío y scores neutros.
    """
    neutral = {
        "clarity": 70,
        "consistency": 70,
        "efficiency": 70,
        "security": 70,
        "structure": 70,
    }
    if not _AVAILABLE:
        return [], neutral
    try:
        report = analyze(text, fast=True)
        findings = []
        for issue in getattr(report, "issues", []):
            findings.append(
                {
                    "ruleId": getattr(
                        issue, "rule_id", getattr(issue, "code", "PQ000")
                    ),
                    "severity": getattr(issue, "severity", "warning"),
                    "line": getattr(issue, "line", None),
                    "message": getattr(issue, "message", str(issue)),
                    "suggestion": getattr(issue, "suggestion", None),
                    "source": "promptqc",
                }
            )
        scores = {
            "clarity": getattr(report, "clarity_score", 70),
            "consistency": getattr(report, "consistency_score", 70),
            "efficiency": getattr(report, "efficiency_score", 70),
            "security": getattr(report, "security_score", 70),
            "structure": getattr(report, "structure_score", 70),
        }
        return findings, scores
    except Exception as e:
        logger.exception("promptqc falló: %s", e)
        return [], neutral
