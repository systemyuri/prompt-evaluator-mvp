from typing import Literal

from pydantic import BaseModel, Field

Format = Literal["plaintext", "markdown", "json", "xml", "yaml"]
TaskNature = Literal["reasoning", "extraction", "classification", "creative", "other"]
Severity = Literal["info", "warning", "error"]


class Example(BaseModel):
    input: str
    output: str


class BuilderRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=2000)
    task: str = Field(..., min_length=1, max_length=2000)
    context: str | None = Field(None, max_length=5000)
    constraints: list[str] | None = None
    outputFormat: str | None = Field(None, max_length=1000)
    examples: list[Example] | None = None
    targetModel: str | None = None
    taskNature: TaskNature | None = None
    chosenFormat: Format


class FreeRequest(BaseModel):
    promptText: str = Field(..., min_length=10, max_length=20000)
    targetModel: str | None = None
    taskNature: TaskNature | None = None


class Finding(BaseModel):
    ruleId: str
    severity: Severity
    line: int | None = None
    message: str
    suggestion: str | None = None
    source: str  # "promptdoctor" | "promptqc" | "promptclarity"


class CategoryScores(BaseModel):
    clarity: int
    consistency: int
    efficiency: int
    security: int
    structure: int


class EstimatedTokens(BaseModel):
    chosenFormat: int | None = None
    detectedFormat: int | None = None
    plainTextBaseline: int
    overheadPercentage: float


class FormatRecommendation(BaseModel):
    recommendedFormat: Format
    detectedFormat: Format | None = None
    rationale: str


class ValidationResponse(BaseModel):
    overallScore: int
    grade: Literal["A", "B", "C", "D", "F"]
    detectedFormat: Format | None = None
    categoryScores: CategoryScores
    estimatedTokens: EstimatedTokens
    findings: list[Finding]
    formatRecommendation: FormatRecommendation
    assembledPrompt: str | None = None
