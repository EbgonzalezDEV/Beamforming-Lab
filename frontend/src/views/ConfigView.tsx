import { useState, FC } from 'react';
import { ConfigModel, CONFIG_LIMITS, SYSTEM_OPTIONS } from '../models/ConfigModel';

interface ConfigViewProps {
  onRunSimulation: (config: ConfigModel) => void;
  isLoading?: boolean;
}

export const ConfigView: FC<ConfigViewProps> = ({ onRunSimulation, isLoading = false }) => {
  const [config, setConfig] = useState<ConfigModel>(new ConfigModel());

  const handleConfigChange = (key: 'frequency' | 'power' | 'distance' | 'system', value: number | string) => {
    const newConfig = new ConfigModel(
      key === 'frequency' ? (value as number) : config.frequency,
      key === 'power' ? (value as number) : config.power,
      key === 'distance' ? (value as number) : config.distance,
      key === 'system' ? (value as ConfigModel['system']) : config.system
    );
    setConfig(newConfig);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunSimulation(config);
  };

  const formatValue = (value: number, unit: string) => `${value} ${unit}`;

  const SYSTEM_BG: Record<ConfigModel['system'], string> = {
    '5G': '#0b1220',
    '5G-A': '#0b1a14',
    '6G': '#160b20',
  };

  const SystemButton = ({ label }: { label: ConfigModel['system'] }) => (
    <button
      type="button"
      onClick={() => handleConfigChange('system', label)}
      disabled={isLoading}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
        config.system === label
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-1 md:p-2" style={{ backgroundColor: SYSTEM_BG[config.system] }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-2">⚙️ Configuración</h2>
          <p className="text-slate-300 mb-6 text-sm">Ajusta frecuencia, potencia, distancia y sistema. Estos parámetros impactan el FSPL y la SNR del enlace.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">📡 Frecuencia: {formatValue(config.frequency, 'MHz')}</label>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-5">
                  <input type="range" min={CONFIG_LIMITS.frequency.min} max={CONFIG_LIMITS.frequency.max} step={CONFIG_LIMITS.frequency.step} value={config.frequency} onChange={(e) => handleConfigChange('frequency', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
                </div>
                <div>
                  <input
                    type="number"
                    min={CONFIG_LIMITS.frequency.min}
                    max={CONFIG_LIMITS.frequency.max}
                    step={CONFIG_LIMITS.frequency.step}
                    value={config.frequency}
                    onChange={(e) => handleConfigChange('frequency', Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400"><span>{CONFIG_LIMITS.frequency.min} MHz</span><span>{CONFIG_LIMITS.frequency.max} MHz</span></div>
              <div className="text-xs text-slate-400">Frecuencias mayores incrementan la pérdida en espacio libre (FSPL).</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-300">⚡ Potencia: {formatValue(config.power, 'dBm')}</label>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-5">
                  <input type="range" min={CONFIG_LIMITS.power.min} max={CONFIG_LIMITS.power.max} step={CONFIG_LIMITS.power.step} value={config.power} onChange={(e) => handleConfigChange('power', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
                </div>
                <div>
                  <input
                    type="number"
                    min={CONFIG_LIMITS.power.min}
                    max={CONFIG_LIMITS.power.max}
                    step={CONFIG_LIMITS.power.step}
                    value={config.power}
                    onChange={(e) => handleConfigChange('power', Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400"><span>{CONFIG_LIMITS.power.min} dBm</span><span>{CONFIG_LIMITS.power.max} dBm</span></div>
              <div className="text-xs text-slate-400">Una mayor potencia de transmisión puede mejorar la SNR, hasta los límites regulatorios.</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">📏 Distancia: {formatValue(config.distance, 'm')}</label>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-5">
                  <input type="range" min={CONFIG_LIMITS.distance.min} max={CONFIG_LIMITS.distance.max} step={CONFIG_LIMITS.distance.step} value={config.distance} onChange={(e) => handleConfigChange('distance', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
                </div>
                <div>
                  <input
                    type="number"
                    min={CONFIG_LIMITS.distance.min}
                    max={CONFIG_LIMITS.distance.max}
                    step={CONFIG_LIMITS.distance.step}
                    value={config.distance}
                    onChange={(e) => handleConfigChange('distance', Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400"><span>{CONFIG_LIMITS.distance.min} m</span><span>{CONFIG_LIMITS.distance.max} m</span></div>
              <div className="text-xs text-slate-400">La pérdida de trayecto aumenta con la distancia, degradando la potencia recibida.</div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-cyan-300">🌐 Sistema</label>
              <div className="flex flex-wrap gap-2">
                {SYSTEM_OPTIONS.map(opt => (
                  <SystemButton key={opt} label={opt} />
                ))}
              </div>
              <div className="text-xs text-slate-400">El tipo de sistema puede implicar distintos anchos de banda y técnicas de modulación. El fondo varía según la selección.</div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 rounded-xl text-xl font-semibold transition-all duration-300 ${isLoading ? 'bg-slate-600 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 text-white shadow-lg'}`}>{isLoading ? 'Ejecutando...' : '🚀 Ejecutar Simulación'}</button>
            </div>
          </form>

          <div className="mt-8 p-6 bg-slate-700 rounded-xl border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-1">📊 Resumen</h3>
            <p className="text-slate-300 text-sm mb-4">Verifica los parámetros elegidos antes de ejecutar. Puedes modificar y volver a simular.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-600 p-4 rounded-lg border border-slate-500"><span className="text-blue-300">Frecuencia:</span><div className="font-semibold text-white text-lg">{config.frequency} MHz</div></div>
              <div className="bg-slate-600 p-4 rounded-lg border border-slate-500"><span className="text-green-300">Potencia:</span><div className="font-semibold text-white text-lg">{config.power} dBm</div></div>
              <div className="bg-slate-600 p-4 rounded-lg border border-slate-500"><span className="text-purple-300">Distancia:</span><div className="font-semibold text-white text-lg">{config.distance} m</div></div>
              <div className="bg-slate-600 p-4 rounded-lg border border-slate-500"><span className="text-cyan-300">Sistema:</span><div className="font-semibold text-white text-lg">{config.system}</div></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb { appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3); }
        .slider::-moz-range-thumb { height: 20px; width: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: none; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3); }
      `}</style>
    </div>
  );
};