"""
Wrapper defensivo sobre promptdoctor.
Si la librería no está disponible o falla, devuelve lista vacía y loguea.
"""

import logging

logger = logging.getLogger(__name__)

try:
    import promptdoctor  # type: ignore

    _AVAILABLE = True
except ImportError:
    _AVAILABLE = False
    logger.warning("promptdoctor no disponible. Se omite su ejecución.")


def run(text: str) -> list[dict]:
    if not _AVAILABLE:
        return []
    try:
        # API puede variar según versión; se intenta el patrón más común.
        report = promptdoctor.lint(text) if hasattr(promptdoctor, "lint") else None
        if report is None:
            return []
        findings = []
        for issue in getattr(
            report, "issues", report if isinstance(report, list) else []
        ):
            findings.append(
                {
                    "ruleId": getattr(
                        issue, "rule_id", getattr(issue, "code", "PD000")
                    ),
                    "severity": getattr(issue, "severity", "warning"),
                    "line": getattr(issue, "line", None),
                    "message": getattr(issue, "message", str(issue)),
                    "suggestion": getattr(issue, "suggestion", None),
                    "source": "promptdoctor",
                }
            )
        return findings
    except Exception as e:
        logger.exception("promptdoctor falló: %s", e)
        return []
