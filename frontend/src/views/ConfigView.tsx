import { useState, type FC } from 'react';
import { ConfigModel, CONFIG_LIMITS, SYSTEM_OPTIONS, type Polarization } from '../models/ConfigModel';
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
  Settings,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface ConfigViewProps {
  onRunSimulation: (config: ConfigModel) => void;
  isLoading?: boolean;
}

export const ConfigView: FC<ConfigViewProps> = ({ onRunSimulation, isLoading = false }) => {
  const [config, setConfig] = useState<ConfigModel>(new ConfigModel());
  const [powerUnit, setPowerUnit] = useState<'dBm' | 'dBW'>('dBm');
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'km'>('m');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showTooltips, setShowTooltips] = useState(true);

  const handleConfigChange = (key: 'frequency' | 'power' | 'distance' | 'system', value: number | string) => {
    const newConfig = new ConfigModel(
      key === 'frequency' ? (value as number) : config.frequency,
      key === 'power' ? (value as number) : config.power,
      key === 'distance' ? (value as number) : config.distance,
      key === 'system' ? (value as ConfigModel['system']) : config.system,
      config.tx_antenna,
      config.rx_antenna
    );
    setConfig(newConfig);
    const validation = newConfig.validate();
    setValidationErrors(validation.errors);
  };

  const handleAntennaChange = (
    side: 'tx' | 'rx',
    key: 'gain_dbi' | 'polarization' | 'beamwidth_deg',
    value: number | Polarization
  ) => {
    const next = new ConfigModel(
      config.frequency,
      config.power,
      config.distance,
      config.system,
      side === 'tx'
        ? { ...config.tx_antenna, [key]: value as any }
        : config.tx_antenna,
      side === 'rx'
        ? { ...config.rx_antenna, [key]: value as any }
        : config.rx_antenna
    );
    setConfig(next);
    const validation = next.validate();
    setValidationErrors(validation.errors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = config.validate();
    if (validation.isValid) {
      onRunSimulation(config);
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const toDisplayPower = (dbm: number) => powerUnit === 'dBm' ? dbm : (dbm - 30);
  const toDisplayDistance = (m: number) => distanceUnit === 'm' ? m : (m / 1000);
  const fromDisplayDistance = (val: number) => distanceUnit === 'm' ? val : (val * 1000);
  const getBandwidthLimits = (system: ConfigModel['system']) => {
    // Rango sugerido por sistema (en MHz)
    if (system === '5G') return { min: 5, max: 100, step: 5 };
    if (system === '5G-A') return { min: 20, max: 200, step: 10 };
    return { min: 50, max: 1000, step: 10 }; // 6G
  };

  const getTypicalValues = (system: ConfigModel['system']) => {
    const typicals = {
      '5G': { freq: 3500, power: 23, distance: 200, txGain: 15, rxGain: 15 },
      '5G-A': { freq: 3500, power: 30, distance: 500, txGain: 18, rxGain: 18 },
      '6G': { freq: 6000, power: 35, distance: 1000, txGain: 20, rxGain: 20 },
    };
    return typicals[system];
  };

  const applyTypicalValues = () => {
    const typical = getTypicalValues(config.system);
    const newConfig = new ConfigModel(
      typical.freq,
      typical.power,
      typical.distance,
      config.system,
      { gain_dbi: typical.txGain, polarization: 'H', beamwidth_deg: 65 },
      { gain_dbi: typical.rxGain, polarization: 'H', beamwidth_deg: 65 }
    );
    setConfig(newConfig);
    const validation = newConfig.validate();
    setValidationErrors(validation.errors);
  };

  const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
    <div className="relative group">
      {children}
      {showTooltips && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );

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
        
        {/* Toolbar */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            type="button"
            onClick={() => setShowTooltips(!showTooltips)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              showTooltips 
                ? 'bg-primary-600 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showTooltips ? 'Ocultar Ayudas' : 'Mostrar Ayudas'}</span>
          </button>
          
          <button
            type="button"
            onClick={applyTypicalValues}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all disabled:opacity-50"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Valores Típicos</span>
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="glass-card-strong p-4 border-red-500/20 mt-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-2">Errores de validación:</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
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
        <Tooltip content="Frecuencia portadora del sistema. Valores típicos: 5G (2.4-3.5 GHz), 5G-A (3.5-6 GHz), 6G (6+ GHz). Mayor frecuencia = mayor pérdida de trayecto.">
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
                  step={10}
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
                step={10}
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
        </Tooltip>

        {/* Bandwidth */}
        <Tooltip content="Ancho de banda del canal. Afecta el piso de ruido (kTB) y por ende el SNR. Rango sugerido depende del sistema.">
          <ParameterCard
            title="Ancho de Banda"
            value={config.bandwidth_mhz.toString()}
            unit="MHz"
            icon={TrendingUp}
            color="bg-gradient-to-r from-primary-500 to-primary-600"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                {(() => { const bw = getBandwidthLimits(config.system); return (
                  <>
                    <input
                      type="range"
                      min={bw.min}
                      max={bw.max}
                      step={bw.step}
                      value={config.bandwidth_mhz}
                      onChange={(e) => setConfig(new ConfigModel(
                        config.frequency,
                        config.power,
                        config.distance,
                        config.system,
                        config.tx_antenna,
                        config.rx_antenna,
                        Number(e.target.value)
                      ))}
                      className="slider-custom"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{bw.min} MHz</span>
                      <span>{bw.max} MHz</span>
                    </div>
                  </>
                )})()}
              </div>
              {(() => { const bw = getBandwidthLimits(config.system); return (
                <input
                  type="number"
                  min={bw.min}
                  max={bw.max}
                  step={bw.step}
                  value={config.bandwidth_mhz}
                  onChange={(e) => setConfig(new ConfigModel(
                    config.frequency,
                    config.power,
                    config.distance,
                    config.system,
                    config.tx_antenna,
                    config.rx_antenna,
                    Number(e.target.value)
                  ))}
                  className="input-field"
                  disabled={isLoading}
                />
              )})()}
              <div className="text-xs text-white/60 flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 text-primary-400" />
                <span>Mayor ancho de banda incrementa el piso de ruido y puede reducir la SNR.</span>
              </div>
            </div>
          </ParameterCard>
        </Tooltip>

        {/* Power */}
        <Tooltip content="Potencia de salida del transmisor. Valores típicos: 5G (20-30 dBm), 5G-A (25-35 dBm), 6G (30-40 dBm). Mayor potencia mejora SNR pero está limitada por regulaciones.">
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
                step={1}
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
              step={1}
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
        </Tooltip>

        {/* Distance */}
        <Tooltip content="Distancia entre transmisor y receptor. Valores típicos: 5G (100-500m), 5G-A (200-1km), 6G (500m-2km). Mayor distancia aumenta la pérdida de trayecto exponencialmente.">
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
                step={distanceUnit === 'm' ? 10 : 100}
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
              step={distanceUnit === 'm' ? 10 : 0.1}
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
        </Tooltip>

        {/* TX Antenna */}
        <Tooltip content="Antena transmisora: Ganancia (dBi), Polarización (H/V), Ancho de haz (°). Valores típicos: 15-25 dBi, haz 30-90°. Polarización debe coincidir con RX para evitar pérdidas.">
          <ParameterCard
            title="Antena Emisora (TX)"
            value={`${config.tx_antenna.gain_dbi} dBi, ${config.tx_antenna.polarization}, ${config.tx_antenna.beamwidth_deg}°`}
            unit=""
            icon={Settings}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Ganancia (dBi)</label>
              <input
                type="range"
                min={CONFIG_LIMITS.gain_dbi.min}
                max={CONFIG_LIMITS.gain_dbi.max}
                step={1}
                value={config.tx_antenna.gain_dbi}
                onChange={(e) => handleAntennaChange('tx', 'gain_dbi', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <input
                type="number"
                min={CONFIG_LIMITS.gain_dbi.min}
                max={CONFIG_LIMITS.gain_dbi.max}
                step={1}
                value={config.tx_antenna.gain_dbi}
                onChange={(e) => handleAntennaChange('tx', 'gain_dbi', Number(e.target.value))}
                className="input-field"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Polarización</label>
              <div className="flex gap-2">
                {(['H', 'V'] as Polarization[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAntennaChange('tx', 'polarization', p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      config.tx_antenna.polarization === p ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {p === 'H' ? 'Horizontal' : 'Vertical'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Ancho de haz (°)</label>
              <input
                type="range"
                min={CONFIG_LIMITS.beamwidth_deg.min}
                max={CONFIG_LIMITS.beamwidth_deg.max}
                step={5}
                value={config.tx_antenna.beamwidth_deg}
                onChange={(e) => handleAntennaChange('tx', 'beamwidth_deg', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <input
                type="number"
                min={CONFIG_LIMITS.beamwidth_deg.min}
                max={CONFIG_LIMITS.beamwidth_deg.max}
                step={5}
                value={config.tx_antenna.beamwidth_deg}
                onChange={(e) => handleAntennaChange('tx', 'beamwidth_deg', Number(e.target.value))}
                className="input-field"
                disabled={isLoading}
              />
            </div>
          </div>
          </ParameterCard>
        </Tooltip>

        {/* RX Antenna */}
        <Tooltip content="Antena receptora: Ganancia (dBi), Polarización (H/V), Ancho de haz (°). Debe coincidir polarización con TX. Mayor ganancia mejora sensibilidad del receptor.">
          <ParameterCard
            title="Antena Receptora (RX)"
            value={`${config.rx_antenna.gain_dbi} dBi, ${config.rx_antenna.polarization}, ${config.rx_antenna.beamwidth_deg}°`}
            unit=""
            icon={Settings}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
          >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Ganancia (dBi)</label>
              <input
                type="range"
                min={CONFIG_LIMITS.gain_dbi.min}
                max={CONFIG_LIMITS.gain_dbi.max}
                step={1}
                value={config.rx_antenna.gain_dbi}
                onChange={(e) => handleAntennaChange('rx', 'gain_dbi', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <input
                type="number"
                min={CONFIG_LIMITS.gain_dbi.min}
                max={CONFIG_LIMITS.gain_dbi.max}
                step={1}
                value={config.rx_antenna.gain_dbi}
                onChange={(e) => handleAntennaChange('rx', 'gain_dbi', Number(e.target.value))}
                className="input-field"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Polarización</label>
              <div className="flex gap-2">
                {(['H', 'V'] as Polarization[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAntennaChange('rx', 'polarization', p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      config.rx_antenna.polarization === p ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {p === 'H' ? 'Horizontal' : 'Vertical'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Ancho de haz (°)</label>
              <input
                type="range"
                min={CONFIG_LIMITS.beamwidth_deg.min}
                max={CONFIG_LIMITS.beamwidth_deg.max}
                step={5}
                value={config.rx_antenna.beamwidth_deg}
                onChange={(e) => handleAntennaChange('rx', 'beamwidth_deg', parseInt(e.target.value))}
                className="slider-custom"
                disabled={isLoading}
              />
              <input
                type="number"
                min={CONFIG_LIMITS.beamwidth_deg.min}
                max={CONFIG_LIMITS.beamwidth_deg.max}
                step={5}
                value={config.rx_antenna.beamwidth_deg}
                onChange={(e) => handleAntennaChange('rx', 'beamwidth_deg', Number(e.target.value))}
                className="input-field"
                disabled={isLoading}
              />
            </div>
          </div>
          </ParameterCard>
        </Tooltip>

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
              <div className="metric-card">
                <div className="text-primary-400 text-sm font-medium">Ancho de Banda</div>
                <div className="text-2xl font-bold text-white">{config.bandwidth_mhz} MHz</div>
              </div>
              <div className="metric-card col-span-2">
                <div className="text-purple-300 text-sm font-medium">Antena TX</div>
                <div className="text-white">
                  {config.tx_antenna.gain_dbi} dBi • {config.tx_antenna.polarization} • {config.tx_antenna.beamwidth_deg}°
                </div>
              </div>
              <div className="metric-card col-span-2">
                <div className="text-emerald-300 text-sm font-medium">Antena RX</div>
                <div className="text-white">
                  {config.rx_antenna.gain_dbi} dBi • {config.rx_antenna.polarization} • {config.rx_antenna.beamwidth_deg}°
                </div>
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