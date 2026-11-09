export type Format = 'plaintext' | 'markdown' | 'json' | 'xml' | 'yaml';
export type TaskNature = 'reasoning' | 'extraction' | 'classification' | 'creative' | 'other';

export interface Finding {
  ruleId: string;
  severity: 'info' | 'warning' | 'error';
  line?: number | null;
  message: string;
  suggestion?: string | null;
  source: string;
}

export interface ValidationResponse {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  detectedFormat?: Format;
  categoryScores: Record<string, number>;
  estimatedTokens: {
    chosenFormat?: number;
    detectedFormat?: number;
    plainTextBaseline: number;
    overheadPercentage: number;
  };
  findings: Finding[];
  formatRecommendation: {
    recommendedFormat: Format;
    detectedFormat?: Format;
    rationale: string;
  };
  assembledPrompt?: string;
}

export interface BuilderRequest {
  role: string;
  task: string;
  context?: string;
  constraints?: string[];
  outputFormat?: string;
  examples?: { input: string; output: string }[];
  targetModel?: string;
  taskNature?: TaskNature;
  chosenFormat: Format;
}

export interface FreeRequest {
  promptText: string;
  targetModel?: string;
  taskNature?: TaskNature;
}