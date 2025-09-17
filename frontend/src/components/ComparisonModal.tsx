import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity
} from 'lucide-react';
import Modal from './Modal';

interface ComparisonData {
  systems: {
    [key: string]: {
      power_received: number;
      snr: number;
      path_loss: number;
      bandwidth_hz: number;
      system_gain: number;
    };
  };
  range_data: {
    [key: string]: Array<{
      distance: number;
      power_received: number;
      snr: number;
      path_loss: number;
    }>;
  };
  parameters: {
    power_dbm: number;
    frequency_hz: number;
    distance_m: number;
    bandwidth_hz?: number;
  };
}

interface ComparisonModalProps {
  open: boolean;
  onClose: () => void;
  comparisonData: ComparisonData | null;
}

const SYSTEM_COLORS = {
  '5G': '#3b82f6',
  '5G-A': '#22c55e', 
  '6G': '#a855f7'
};

const SYSTEM_NAMES = {
  '5G': '5G (Sub-6 GHz)',
  '5G-A': '5G-A (Advanced)',
  '6G': '6G (Terahertz)'
};

export default function ComparisonModal({ open, onClose, comparisonData }: ComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'range' | 'spectrum'>('metrics');

  if (!comparisonData) return null;

  const { systems, range_data, parameters } = comparisonData;

  // Preparar datos para gráficas de métricas
  const metricsData = Object.entries(systems).map(([system, data]) => ({
    system: SYSTEM_NAMES[system as keyof typeof SYSTEM_NAMES],
    power_received: data.power_received,
    snr: data.snr,
    path_loss: data.path_loss,
    bandwidth: data.bandwidth_hz / 1e6, // Convertir a MHz
    system_gain: data.system_gain
  }));

  // Preparar datos para gráficas de alcance
  const rangeChartData = Object.entries(range_data).map(([system, data]) => ({
    system: SYSTEM_NAMES[system as keyof typeof SYSTEM_NAMES],
    color: SYSTEM_COLORS[system as keyof typeof SYSTEM_COLORS],
    data: data.map(point => ({
      distance: point.distance / 1000, // Convertir a km
      power_received: point.power_received,
      snr: point.snr,
      path_loss: point.path_loss
    }))
  }));

  const TabButton = ({ label, icon: Icon, isActive, onClick }: {
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
        isActive 
          ? 'bg-primary-600 text-white' 
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Comparación de Sistemas">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-2">
          <TabButton
            label="Métricas"
            icon={BarChart3}
            isActive={activeTab === 'metrics'}
            onClick={() => setActiveTab('metrics')}
          />
          <TabButton
            label="Alcance"
            icon={TrendingUp}
            isActive={activeTab === 'range'}
            onClick={() => setActiveTab('range')}
          />
          <TabButton
            label="Espectro"
            icon={Activity}
            isActive={activeTab === 'spectrum'}
            onClick={() => setActiveTab('spectrum')}
          />
        </div>

        {/* Parámetros de comparación */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Parámetros de Comparación</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-white/60">Potencia:</span>
              <div className="font-semibold text-white">{parameters.power_dbm} dBm</div>
            </div>
            <div>
              <span className="text-white/60">Frecuencia:</span>
              <div className="font-semibold text-white">{parameters.frequency_hz / 1e6} MHz</div>
            </div>
            <div>
              <span className="text-white/60">Distancia:</span>
              <div className="font-semibold text-white">{parameters.distance_m} m</div>
            </div>
            <div>
              <span className="text-white/60">Ancho de banda:</span>
              <div className="font-semibold text-white">{parameters.bandwidth_hz ? (parameters.bandwidth_hz / 1e6).toFixed(0) : '-'} MHz</div>
            </div>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Gráfica de barras - Potencia recibida */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Potencia Recibida por Sistema</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="system" 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v) => `${v} dBm`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: '#fff',
                        borderRadius: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} dBm`, 'Potencia Recibida']}
                    />
                    <Bar dataKey="power_received" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica de barras - SNR */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Relación Señal-Ruido (SNR)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="system" 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v) => `${v} dB`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: '#fff',
                        borderRadius: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} dB`, 'SNR']}
                    />
                    <Bar dataKey="snr" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'range' && (
          <div className="space-y-6">
            {/* Gráfica de alcance - Potencia */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alcance de Potencia Recibida</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="distance" 
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickCount={6}
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v: number) => (v < 1 ? v.toFixed(2) : v.toFixed(1))}
                      label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    />
                    <YAxis 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v) => `${v} dBm`}
                      label={{ value: 'Potencia (dBm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: '#fff',
                        borderRadius: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} dBm`, 'Potencia Recibida']}
                      labelFormatter={(label: number) => `Distancia: ${(label < 1 ? label.toFixed(2) : label.toFixed(1))} km`}
                    />
                    <Legend />
                    {rangeChartData.map(({ system, color, data }) => (
                      <Line
                        key={system}
                        type="monotone"
                        dataKey="power_received"
                        data={data}
                        stroke={color}
                        strokeWidth={3}
                        name={system}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica de alcance - SNR */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alcance de SNR</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="distance" 
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickCount={6}
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v: number) => (v < 1 ? v.toFixed(2) : v.toFixed(1))}
                      label={{ value: 'Distancia (km)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    />
                    <YAxis 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v) => `${v} dB`}
                      label={{ value: 'SNR (dB)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: '#fff',
                        borderRadius: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} dB`, 'SNR']}
                      labelFormatter={(label: number) => `Distancia: ${(label < 1 ? label.toFixed(2) : label.toFixed(1))} km`}
                    />
                    <Legend />
                    {rangeChartData.map(({ system, color, data }) => (
                      <Line
                        key={system}
                        type="monotone"
                        dataKey="snr"
                        data={data}
                        stroke={color}
                        strokeWidth={3}
                        name={system}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spectrum' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Comparación de Ancho de Banda</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="system" 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      tickFormatter={(v) => `${v} MHz`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: '#fff',
                        borderRadius: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} MHz`, 'Ancho de Banda']}
                    />
                    <Bar dataKey="bandwidth" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla de comparación */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen Comparativo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/70">Sistema</th>
                      <th className="text-right py-3 px-4 text-white/70">Potencia (dBm)</th>
                      <th className="text-right py-3 px-4 text-white/70">SNR (dB)</th>
                      <th className="text-right py-3 px-4 text-white/70">Ancho de Banda (MHz)</th>
                      <th className="text-right py-3 px-4 text-white/70">Ganancia (dB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsData.map((row, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white font-medium">{row.system}</td>
                        <td className="py-3 px-4 text-right text-white">{row.power_received.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-white">{row.snr.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-white">{row.bandwidth.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-white">{row.system_gain.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
