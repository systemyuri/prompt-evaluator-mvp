from app.models import Format, FormatRecommendation, TaskNature

_SMALL_MODELS = {"gpt-4o-mini", "haiku", "claude-haiku", "llama-8b", "mistral-7b"}


def _is_small_model(model: str | None) -> bool:
    if not model:
        return False
    return any(k in model.lower() for k in _SMALL_MODELS)


def recommend(
    target_model: str | None,
    task_nature: TaskNature | None,
    chosen_format: Format | None = None,
    detected_format: Format | None = None,
) -> FormatRecommendation:
    current = chosen_format or detected_format or "plaintext"
    small = _is_small_model(target_model)

    # Regla 1: modelo pequeño + razonamiento → evitar JSON/XML
    if small and task_nature == "reasoning" and current in ("json", "xml"):
        return FormatRecommendation(
            recommendedFormat="plaintext",
            detectedFormat=detected_format,
            rationale=(
                "El prompt se dirige a un modelo pequeño para una tarea de razonamiento. "
                "JSON/XML pueden introducir 'structure tax' y degradar la precisión. "
                "Se recomienda texto plano."
            ),
        )

    # Regla 2: extracción/clasificación con modelo grande → Markdown para prompt + JSON para salida
    if not small and task_nature in ("extraction", "classification"):
        return FormatRecommendation(
            recommendedFormat="markdown",
            detectedFormat=detected_format,
            rationale=(
                "Modelo grande en tarea de extracción/clasificación: Markdown ofrece buena "
                "legibilidad y compatibilidad. Usa JSON solo para especificar la estructura de salida."
            ),
        )

    # Regla 3: coste crítico → texto plano
    if current in ("json", "xml", "yaml"):
        return FormatRecommendation(
            recommendedFormat="plaintext",
            detectedFormat=detected_format,
            rationale=(
                "Texto plano es el formato más eficiente en tokens (baseline). "
                "Si el coste por token es crítico, evita estructuras rígidas."
            ),
        )

    # Regla 4: por defecto, Markdown como máximo común divisor
    return FormatRecommendation(
        recommendedFormat="markdown",
        detectedFormat=detected_format,
        rationale=(
            "Markdown es el máximo común divisor entre proveedores: estructura legible "
            "con sobrecarga moderada. Ajusta según tu modelo objetivo."
        ),
    )
