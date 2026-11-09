"""
Wrapper defensivo sobre promptclarity-sdk en modo rule-only (sin LLM).
"""

import logging

logger = logging.getLogger(__name__)

try:
    from promptclarity import PromptClarity  # type: ignore

    _GUARD = PromptClarity()  # modo rule-only por defecto
    _AVAILABLE = True
except ImportError:
    _GUARD = None
    _AVAILABLE = False
    logger.warning("promptclarity-sdk no disponible. Se omite su ejecución.")


def run(text: str) -> list[dict]:
    if not _AVAILABLE or _GUARD is None:
        return []
    try:
        result = _GUARD.validate(text)
        data = result.to_dict() if hasattr(result, "to_dict") else {}
        findings = []
        for issue in data.get("issues", []):
            findings.append(
                {
                    "ruleId": issue.get("rule_id", "PC000"),
                    "severity": issue.get("severity", "warning"),
                    "line": issue.get("line"),
                    "message": issue.get("message", ""),
                    "suggestion": issue.get("suggestion"),
                    "source": "promptclarity",
                }
            )
        return findings
    except Exception as e:
        logger.exception("promptclarity-sdk falló: %s", e)
        return []
