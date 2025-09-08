import { FC } from 'react';
import { ResultsModel } from '../models/ResultsModel';

interface ResultsViewProps {
  results: ResultsModel;
  onBackToConfig: () => void;
}

export const ResultsView: FC<ResultsViewProps> = ({ results, onBackToConfig }) => {
  const summary = results.getSummary();

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Resultados de Simulación
          </h1>
          <p className="text-lg text-slate-300">
            Análisis de Parámetros de Beamforming
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">⚙️ Configuración Utilizada</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 text-center">
              <div className="text-3xl mb-3">📡</div>
              <div className="text-sm text-blue-300 mb-2">Frecuencia</div>
              <div className="font-bold text-white text-2xl">{results.config.frequency} MHz</div>
            </div>
            <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-sm text-green-300 mb-2">Potencia</div>
              <div className="font-bold text-white text-2xl">{results.config.power} dBm</div>
            </div>
            <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 text-center">
              <div className="text-3xl mb-3">📏</div>
              <div className="text-sm text-purple-300 mb-2">Distancia</div>
              <div className="font-bold text-white text-2xl">{results.config.distance} m</div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parameters Analysis */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🔬</span>
              Análisis de Parámetros
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-blue-300 text-sm mb-1">Frecuencia de Operación</div>
                <div className="text-white text-lg font-semibold">{results.config.frequency} MHz</div>
                <div className="text-slate-400 text-sm">
                  {results.config.frequency >= 3000 ? 'Banda de microondas' : 'Banda de radiofrecuencia'}
                </div>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-green-300 text-sm mb-1">Nivel de Potencia</div>
                <div className="text-white text-lg font-semibold">{results.config.power} dBm</div>
                <div className="text-slate-400 text-sm">
                  {results.config.power >= 30 ? 'Alta potencia' : results.config.power >= 20 ? 'Potencia media' : 'Baja potencia'}
                </div>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-purple-300 text-sm mb-1">Rango de Comunicación</div>
                <div className="text-white text-lg font-semibold">{results.config.distance} metros</div>
                <div className="text-slate-400 text-sm">
                  {results.config.distance >= 500 ? 'Largo alcance' : results.config.distance >= 100 ? 'Alcance medio' : 'Corto alcance'}
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Info */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Información de Simulación
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-cyan-300 text-sm mb-1">ID de Simulación</div>
                <div className="text-white text-sm font-mono">{results.simulationId}</div>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-yellow-300 text-sm mb-1">Timestamp</div>
                <div className="text-white text-sm">{new Date(results.timestamp).toLocaleString()}</div>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="text-orange-300 text-sm mb-1">Estado</div>
                <div className="text-green-400 text-sm font-semibold">✅ Completada</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mt-8 border border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-2">Acciones Disponibles</h3>
              <p className="text-slate-300">
                Configuración procesada exitosamente. Lista para conectar con el backend.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onBackToConfig}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔄 Nueva Simulación
              </button>
              <button
                onClick={() => console.log('Datos para backend:', results.toJSON())}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📤 Enviar al Backend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};