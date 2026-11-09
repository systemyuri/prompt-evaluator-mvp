import type { Format } from '../../types/validation';

interface Option {
  value: Format;
  label: string;
  efficiency: string;
  advantage: string;
  scenario: string;
  caution: string;
}

const OPTIONS: Option[] = [
  { value: 'plaintext', label: 'Texto Plano', efficiency: 'Máxima', advantage: 'Coste mínimo, sin sobrecarga.', scenario: 'Modelos pequeños, razonamiento o coste crítico.', caution: 'Puede perder legibilidad en prompts largos.' },
  { value: 'markdown', label: 'Markdown', efficiency: '+15–25%', advantage: 'Equilibrio entre estructura y legibilidad.', scenario: 'Prompts de sistema con múltiples secciones.', caution: 'Puede introducir ruido en modelos pequeños.' },
  { value: 'json', label: 'JSON', efficiency: '+25–40%', advantage: 'Alta precisión para salidas estructuradas.', scenario: 'Clasificación o extracción (salida).', caution: 'Evitar como entrada para razonamiento en modelos pequeños.' },
  { value: 'xml', label: 'XML', efficiency: '+13–36%', advantage: 'Estructura muy explícita.', scenario: 'Anidamiento profundo de reglas.', caution: 'El coste extra no siempre mejora la fiabilidad.' },
  { value: 'yaml', label: 'YAML', efficiency: '~-32% vs JSON', advantage: 'Punto medio entre estructura y eficiencia.', scenario: 'Configuraciones de agentes.', caution: 'Menos ubicuo en el ecosistema de modelos.' },
];

interface Props {
  value: Format;
  onChange: (f: Format) => void;
}

export default function FormatSelector({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="text-base font-bold text-slate-900 mb-2">Formato del Prompt</legend>
      <p className="text-xs text-slate-500 mb-4 italic">El formato es un medio, no un fin. Elige según tu modelo y tarea.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all duration-200 ${
                isSelected ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{opt.label}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                    {opt.efficiency}
                  </span>
                </div>
                <span className="text-xs text-slate-600 mb-3 flex-grow">{opt.advantage}</span>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p><b className="text-slate-700">Ideal para:</b> {opt.scenario}</p>
                  <p className="text-amber-700"><b>Ojo:</b> {opt.caution}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}