import { useState } from 'react';
import TokenEstimator from '../components/shared/TokenEstimator';
import { validateFree } from '../services/api';
import type { TaskNature, ValidationResponse } from '../types/validation';

export default function FreeValidatorPage() {
  const [promptText, setPromptText] = useState('');
  const [targetModel, setTargetModel] = useState('');
  const [taskNature, setTaskNature] = useState<TaskNature | ''>('');
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onValidate() {
    setLoading(true);
    setError(null);
    try {
      const res = await validateFree({
        promptText,
        targetModel: targetModel || undefined,
        taskNature: taskNature || undefined,
      });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna Izquierda: Entrada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Auditar Prompt Existente</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Modelo Objetivo (Opcional)</label>
            <input placeholder="Ej. gpt-4o-mini" value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Naturaleza (Opcional)</label>
            <select value={taskNature} onChange={(e) => setTaskNature(e.target.value as TaskNature | '')} className={inputClass}>
              <option value="">No especificada</option>
              <option value="reasoning">Razonamiento</option>
              <option value="extraction">Extracción</option>
              <option value="classification">Clasificación</option>
              <option value="creative">Creativa</option>
            </select>
          </div>
        </div>

        <div className="flex-grow flex flex-col mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Pega tu Prompt completo aquí</label>
          <textarea
            placeholder="Eres un asistente útil..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full flex-grow rounded-md border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={15}
          />
        </div>

        <button 
          onClick={onValidate} 
          disabled={loading || promptText.length < 10} 
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
        >
          {loading ? 'Analizando Prompt...' : 'Analizar Prompt'}
        </button>
      </div>

      {/* Columna Derecha: Resultados */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reporte de Auditoría</h2>
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{error}</div>}
        
        {!result && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            Pega un prompt y haz clic en "Analizar Prompt" para obtener el diagnóstico.
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Puntuación Global</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${result.overallScore >= 70 ? 'text-green-600' : result.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.overallScore}
                  </span>
                  <span className="text-xl font-medium text-gray-400">/ 100</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Formato detectado: <span className="font-bold uppercase">{result.detectedFormat}</span></p>
              </div>
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gray-100 ${result.grade === 'A' ? 'text-green-600' : result.grade === 'B' ? 'text-blue-600' : result.grade === 'C' ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.grade}
              </div>
            </div>

            <TokenEstimator {...result.estimatedTokens} />

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2">Recomendación de Formato</h3>
              <p className="text-sm text-blue-700 mb-1"><b>Formato sugerido:</b> {result.formatRecommendation.recommendedFormat}</p>
              <p className="text-sm text-blue-700">{result.formatRecommendation.rationale}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Hallazgos ({result.findings.length})</h3>
              {result.findings.length === 0 ? (
                <p className="text-green-600 text-sm">¡No se encontraron problemas estructurales!</p>
              ) : (
                <ul className="space-y-3">
                  {result.findings.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={`shrink-0 font-bold ${f.severity === 'error' ? 'text-red-500' : f.severity === 'warning' ? 'text-yellow-600' : 'text-gray-500'}`}>
                        [{f.severity.toUpperCase()}]
                      </span>
                      <div>
                        <p className="text-gray-800">{f.line ? `Línea ${f.line}: ` : ''}{f.message}</p>
                        {f.suggestion && <p className="text-gray-500 text-xs mt-1 italic">Sugerencia: {f.suggestion}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}