import { useState } from 'react';
import FormatSelector from '../components/shared/FormatSelector';
import TokenEstimator from '../components/shared/TokenEstimator';
import { validateBuilder } from '../services/api';
import type { Format, TaskNature, ValidationResponse } from '../types/validation';

export default function BuilderPage() {
  const [role, setRole] = useState('');
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [targetModel, setTargetModel] = useState('');
  const [taskNature, setTaskNature] = useState<TaskNature | ''>('');
  const [chosenFormat, setChosenFormat] = useState<Format>('markdown');
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onValidate() {
    setLoading(true);
    setError(null);
    try {
      const res = await validateBuilder({
        role, task,
        context: context || undefined,
        constraints: constraints ? constraints.split('\n').filter(Boolean) : undefined,
        outputFormat: outputFormat || undefined,
        targetModel: targetModel || undefined,
        taskNature: taskNature || undefined,
        chosenFormat,
      });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Clases reutilizables para los inputs
  const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Formulario (7/12) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Configuración del Prompt</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="targetModel" className={labelClass}>Modelo Objetivo</label>
              <input id="targetModel" placeholder="Ej. gpt-4o-mini" value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="taskNature" className={labelClass}>Naturaleza de la tarea</label>
              <select id="taskNature" value={taskNature} onChange={(e) => setTaskNature(e.target.value as TaskNature | '')} className={inputClass}>
                <option value="">Opcional</option>
                <option value="reasoning">Razonamiento</option>
                <option value="extraction">Extracción</option>
                <option value="classification">Clasificación</option>
                <option value="creative">Creativa</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="role" className={labelClass}>Rol / Persona</label>
              <input id="role" placeholder="Ej. Eres un ingeniero de software senior..." value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="task" className={labelClass}>Tarea Principal</label>
              <textarea id="task" placeholder="Ej. Genera una API CRUD para..." value={task} onChange={(e) => setTask(e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label htmlFor="context" className={labelClass}>Contexto</label>
              <textarea id="context" placeholder="Información adicional de trasfondo..." value={context} onChange={(e) => setContext(e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label htmlFor="constraints" className={labelClass}>Restricciones (Una por línea)</label>
              <textarea id="constraints" placeholder="Ej. No uses librerías externas" value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label htmlFor="outputFormat" className={labelClass}>Formato de Salida</label>
              <textarea id="outputFormat" placeholder="Ej. Devuelve un JSON con claves 'id' y 'nombre'" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} rows={2} className={`${inputClass} resize-y`} />
            </div>
          </div>

          <div className="mt-8">
            <FormatSelector value={chosenFormat} onChange={setChosenFormat} />
          </div>

          <button 
            onClick={onValidate} 
            disabled={loading || !role || !task} 
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? 'Analizando Prompt...' : 'Validar Estructura'}
          </button>
        </div>
      </div>

      {/* Columna Derecha: Resultados (5/12) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Resultados de la Evaluación</h2>
          
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-4">{error}</div>}
          
          {!result && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Esperando análisis...</p>
              <p className="text-slate-400 text-sm mt-1">Llena el formulario y haz clic en "Validar Estructura".</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Puntuación Global</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-extrabold tracking-tight ${result.overallScore >= 70 ? 'text-emerald-600' : result.overallScore >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
                      {result.overallScore}
                    </span>
                    <span className="text-xl font-medium text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-3xl font-extrabold border-4 ${result.grade === 'A' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : result.grade === 'B' ? 'border-blue-100 bg-blue-50 text-blue-600' : result.grade === 'C' ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                  {result.grade}
                </div>
              </div>

              <TokenEstimator {...result.estimatedTokens} />

              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Recomendación de Formato
                </h3>
                <p className="text-sm text-indigo-800 mb-2 font-medium">Sugerencia: <span className="uppercase font-bold">{result.formatRecommendation.recommendedFormat}</span></p>
                <p className="text-sm text-indigo-700 leading-relaxed">{result.formatRecommendation.rationale}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Hallazgos ({result.findings.length})</h3>
                {result.findings.length === 0 ? (
                  <div className="text-emerald-600 text-sm flex items-center gap-2 font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ¡No se encontraron problemas estructurales!
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {result.findings.map((f, i) => (
                      <li key={i} className="flex gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full h-fit ${f.severity === 'error' ? 'bg-red-100 text-red-700' : f.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                          {f.severity.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-slate-800 font-medium">{f.message}</p>
                          {f.suggestion && <p className="text-slate-500 text-xs mt-1 leading-relaxed"><b>Sugerencia:</b> {f.suggestion}</p>}
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
    </div>
  );
}