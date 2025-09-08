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

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">⚙️ Configuración de Parámetros</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-blue-300">📡 Frecuencia: {formatValue(config.frequency, 'MHz')}</label>
              <input type="range" min={CONFIG_LIMITS.frequency.min} max={CONFIG_LIMITS.frequency.max} step={CONFIG_LIMITS.frequency.step} value={config.frequency} onChange={(e) => handleConfigChange('frequency', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
              <div className="flex justify-between text-sm text-slate-400"><span>{CONFIG_LIMITS.frequency.min} MHz</span><span>{CONFIG_LIMITS.frequency.max} MHz</span></div>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-medium text-green-300">⚡ Potencia: {formatValue(config.power, 'dBm')}</label>
              <input type="range" min={CONFIG_LIMITS.power.min} max={CONFIG_LIMITS.power.max} step={CONFIG_LIMITS.power.step} value={config.power} onChange={(e) => handleConfigChange('power', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
              <div className="flex justify-between text-sm text-slate-400"><span>{CONFIG_LIMITS.power.min} dBm</span><span>{CONFIG_LIMITS.power.max} dBm</span></div>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-medium text-purple-300">📏 Distancia: {formatValue(config.distance, 'm')}</label>
              <input type="range" min={CONFIG_LIMITS.distance.min} max={CONFIG_LIMITS.distance.max} step={CONFIG_LIMITS.distance.step} value={config.distance} onChange={(e) => handleConfigChange('distance', parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" disabled={isLoading} />
              <div className="flex justify-between text-sm text-slate-400"><span>{CONFIG_LIMITS.distance.min} m</span><span>{CONFIG_LIMITS.distance.max} m</span></div>
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-medium text-cyan-300">🌐 Sistema</label>
              <select value={config.system} onChange={(e) => handleConfigChange('system', e.target.value)} className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {SYSTEM_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 rounded-xl text-xl font-semibold transition-all duration-300 ${isLoading ? 'bg-slate-600 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 text-white shadow-lg'}`}>{isLoading ? 'Ejecutando...' : '🚀 Ejecutar Simulación'}</button>
            </div>
          </form>

          <div className="mt-8 p-6 bg-slate-700 rounded-xl border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Resumen de Configuración</h3>
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