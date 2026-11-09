import json
import re


def detect_format(text: str) -> str:
    """
    Orden de prioridad: json > xml > yaml > markdown > plaintext.
    """
    stripped = text.strip()

    if stripped.startswith(("{", "[")):
        try:
            json.loads(stripped)
            return "json"
        except json.JSONDecodeError:
            pass

    if re.search(r"<[a-zA-Z][^>]*>.*</[a-zA-Z][^>]*>", stripped, re.DOTALL):
        return "xml"

    yaml_lines = sum(
        1 for line in stripped.splitlines() if re.match(r"^\s*\w[\w\-]*:\s", line)
    )
    if yaml_lines >= 2:
        return "yaml"

    if re.search(r"^#{1,6}\s", stripped, re.MULTILINE) or "**" in stripped:
        return "markdown"

    return "plaintext"
