import { useState, type FC } from 'react';
import { ConfigModel, CONFIG_LIMITS, SYSTEM_OPTIONS } from '../models/ConfigModel';
import { 
  Radio, 
  Zap, 
  Ruler, 
  Wifi, 
  Play, 
  RotateCcw, 
  Info,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';

interface ConfigViewProps {
  onRunSimulation: (config: ConfigModel) => void;
  isLoading?: boolean;
}

export const ConfigView: FC<ConfigViewProps> = ({ onRunSimulation, isLoading = false }) => {
  const [config, setConfig] = useState<ConfigModel>(new ConfigModel());
  const [powerUnit, setPowerUnit] = useState<'dBm' | 'dBW'>('dBm');
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'km'>('m');

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

  const toDisplayPower = (dbm: number) => powerUnit === 'dBm' ? dbm : (dbm - 30);
  const toDisplayDistance = (m: number) => distanceUnit === 'm' ? m : (m / 1000);
  const fromDisplayDistance = (val: number) => distanceUnit === 'm' ? val : (val * 1000);

  const SYSTEM_COLORS: Record<ConfigModel['system'], { bg: string; accent: string; icon: string }> = {
    '5G': { bg: 'from-blue-900/20 to-blue-800/20', accent: 'from-blue-500 to-blue-600', icon: 'text-blue-400' },
    '5G-A': { bg: 'from-green-900/20 to-green-800/20', accent: 'from-green-500 to-green-600', icon: 'text-green-400' },
    '6G': { bg: 'from-purple-900/20 to-purple-800/20', accent: 'from-purple-500 to-purple-600', icon: 'text-purple-400' },
  };

  const SystemButton = ({ label }: { label: ConfigModel['system'] }) => {
    const colors = SYSTEM_COLORS[label];
    const isSelected = config.system === label;
    
    return (
      <button
        type="button"
        onClick={() => handleConfigChange('system', label)}
        disabled={isLoading}
        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
          isSelected
            ? `bg-gradient-to-r ${colors.accent} border-transparent text-white shadow-lg`
            : 'glass-card border-white/20 text-white/70 hover:text-white hover:border-white/40'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`icon-wrapper ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
            <Wifi className={`w-5 h-5 ${isSelected ? 'text-white' : colors.icon}`} />
          </div>
          <div className="text-left">
            <div className="font-semibold">{label}</div>
            <div className="text-xs opacity-80">
              {label === '5G' ? 'Sub-6 GHz' : label === '5G-A' ? 'Advanced 5G' : 'Terahertz'}
            </div>
          </div>
        </div>
        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        )}
      </button>
    );
  };

  const ParameterCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color, 
    children 
  }: { 
    title: string; 
    value: string; 
    unit: string; 
    icon: any; 
    color: string; 
    children: React.ReactNode; 
  }) => (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`icon-wrapper ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-white/60 text-sm">{value} {unit}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="icon-wrapper gradient-primary">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">Configuración del Sistema</h1>
        </div>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Ajusta los parámetros de frecuencia, potencia, distancia y sistema para simular el comportamiento 
          de enlaces de comunicaciones inalámbricas.
        </p>
      </div>

      {/* System Selection */}
      <div className="glass-card-strong p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-wrapper gradient-secondary">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Tipo de Sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SYSTEM_OPTIONS.map(opt => (
            <SystemButton key={opt} label={opt} />
          ))}
        </div>
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-primary-400 mt-0.5" />
            <div className="text-sm text-white/70">
              <strong>Nota:</strong> Cada sistema tiene características específicas de ancho de banda, 
              técnicas de modulación y rangos de frecuencia operativos.
            </div>
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency */}
        <ParameterCard
          title="Frecuencia de Operación"
          value={config.frequency.toString()}
          unit="MHz"
          icon={Radio}
          color="bg-gradient-to-r from-primary-500 to-primary-600"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min={CONFIG_LIMITS.frequency.min}
                max={CONFIG_LIMITS.frequency.max}
                step={CONFIG_LIMITS.frequency.step}
                value={config.frequency}
                onChange={(e) => handleConfigChange('frequency', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{CONFIG_LIMITS.frequency.min} MHz</span>
                <span>{CONFIG_LIMITS.frequency.max} MHz</span>
              </div>
            </div>
            <input
              type="number"
              min={CONFIG_LIMITS.frequency.min}
              max={CONFIG_LIMITS.frequency.max}
              step={CONFIG_LIMITS.frequency.step}
              value={config.frequency}
              onChange={(e) => handleConfigChange('frequency', Number(e.target.value))}
              className="input-field"
              disabled={isLoading}
            />
            <div className="text-xs text-white/60 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-warning-400" />
              <span>Frecuencias mayores incrementan la pérdida en espacio libre (FSPL).</span>
            </div>
          </div>
        </ParameterCard>

        {/* Power */}
        <ParameterCard
          title="Potencia de Transmisión"
          value={toDisplayPower(config.power).toString()}
          unit={powerUnit}
          icon={Zap}
          color="bg-gradient-to-r from-accent-500 to-accent-600"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Unidad:</span>
              <div className="flex gap-2">
                {(['dBm', 'dBW'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setPowerUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      powerUnit === u
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={CONFIG_LIMITS.power.min}
                max={CONFIG_LIMITS.power.max}
                step={CONFIG_LIMITS.power.step}
                value={config.power}
                onChange={(e) => handleConfigChange('power', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{powerUnit === 'dBm' ? CONFIG_LIMITS.power.min : CONFIG_LIMITS.power.min - 30} {powerUnit}</span>
                <span>{powerUnit === 'dBm' ? CONFIG_LIMITS.power.max : CONFIG_LIMITS.power.max - 30} {powerUnit}</span>
              </div>
            </div>
            <input
              type="number"
              min={powerUnit === 'dBm' ? CONFIG_LIMITS.power.min : CONFIG_LIMITS.power.min - 30}
              max={powerUnit === 'dBm' ? CONFIG_LIMITS.power.max : CONFIG_LIMITS.power.max - 30}
              step={CONFIG_LIMITS.power.step}
              value={toDisplayPower(config.power)}
              onChange={(e) => handleConfigChange('power', powerUnit === 'dBm' ? Number(e.target.value) : Number(e.target.value) + 30)}
              className="input-field"
              disabled={isLoading}
            />
            <div className="text-xs text-white/60 flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 mt-0.5 text-accent-400" />
              <span>Mayor potencia mejora la SNR hasta los límites regulatorios.</span>
            </div>
          </div>
        </ParameterCard>

        {/* Distance */}
        <ParameterCard
          title="Distancia del Enlace"
          value={toDisplayDistance(config.distance).toString()}
          unit={distanceUnit}
          icon={Ruler}
          color="bg-gradient-to-r from-secondary-500 to-secondary-600"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Unidad:</span>
              <div className="flex gap-2">
                {(['m', 'km'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setDistanceUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      distanceUnit === u
                        ? 'bg-secondary-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={CONFIG_LIMITS.distance.min}
                max={CONFIG_LIMITS.distance.max}
                step={CONFIG_LIMITS.distance.step}
                value={config.distance}
                onChange={(e) => handleConfigChange('distance', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{distanceUnit === 'm' ? CONFIG_LIMITS.distance.min : CONFIG_LIMITS.distance.min / 1000} {distanceUnit}</span>
                <span>{distanceUnit === 'm' ? CONFIG_LIMITS.distance.max : CONFIG_LIMITS.distance.max / 1000} {distanceUnit}</span>
              </div>
            </div>
            <input
              type="number"
              min={distanceUnit === 'm' ? CONFIG_LIMITS.distance.min : CONFIG_LIMITS.distance.min / 1000}
              max={distanceUnit === 'm' ? CONFIG_LIMITS.distance.max : CONFIG_LIMITS.distance.max / 1000}
              step={distanceUnit === 'm' ? CONFIG_LIMITS.distance.step : CONFIG_LIMITS.distance.step / 1000}
              value={toDisplayDistance(config.distance)}
              onChange={(e) => handleConfigChange('distance', fromDisplayDistance(Number(e.target.value)))}
              className="input-field"
              disabled={isLoading}
            />
            <div className="text-xs text-white/60 flex items-start space-x-2">
              <Activity className="w-4 h-4 mt-0.5 text-secondary-400" />
              <span>La pérdida de trayecto aumenta con la distancia, degradando la potencia recibida.</span>
            </div>
          </div>
        </ParameterCard>

        {/* Summary */}
        <div className="glass-card-strong p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-wrapper gradient-accent">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Resumen de Configuración</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <div className="text-primary-400 text-sm font-medium">Frecuencia</div>
                <div className="text-2xl font-bold text-white">{config.frequency} MHz</div>
              </div>
              <div className="metric-card">
                <div className="text-accent-400 text-sm font-medium">Potencia</div>
                <div className="text-2xl font-bold text-white">{config.power} dBm</div>
              </div>
              <div className="metric-card">
                <div className="text-secondary-400 text-sm font-medium">Distancia</div>
                <div className="text-2xl font-bold text-white">{config.distance} m</div>
              </div>
              <div className="metric-card">
                <div className="text-warning-400 text-sm font-medium">Sistema</div>
                <div className="text-2xl font-bold text-white">{config.system}</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-white/70">
                <strong>Estado:</strong> Configuración lista para simulación. 
                Verifica los parámetros antes de ejecutar.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          type="button"
          onClick={() => setConfig(new ConfigModel())}
          disabled={isLoading}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Restablecer</span>
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Ejecutando...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Ejecutar Simulación</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};