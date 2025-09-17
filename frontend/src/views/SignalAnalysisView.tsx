import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, Brush } from 'recharts';
import { 
  BarChart3, 
  Zap, 
  Activity, 
  TrendingUp, 
  Wifi, 
  Maximize2, 
  RefreshCw,
  AlertTriangle,
  Info,
  Download,
  GitCompare,
  Target
} from 'lucide-react';
import Modal from '../components/Modal';
import ComparisonModal from '../components/ComparisonModal';

interface SpectrumPoint { freq: number; magnitude: number }
interface ResultsDto {
	power_received: number | null;
	snr: number | null;
	path_loss: number | null;
	spectrum: SpectrumPoint[];
	system?: string | null;
	bandwidth_hz?: number | null;
    antenna?: {
        tx_gain_dbi: number;
        rx_gain_dbi: number;
        tx_polarization: 'H' | 'V';
        rx_polarization: 'H' | 'V';
        tx_beamwidth_deg: number;
        rx_beamwidth_deg: number;
        polarization_mismatch_loss_db: number;
        antenna_gain_db: number;
    } | null;
    // Echoed input parameters
    power_dbm?: number | null;
    frequency_hz?: number | null;
    distance_m?: number | null;
}

export default function SignalAnalysisView() {
	const [data, setData] = useState<ResultsDto | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [openSpectrum, setOpenSpectrum] = useState(false);
	const [openComparison, setOpenComparison] = useState(false);
	const [comparisonData, setComparisonData] = useState<any>(null);
	const [rangeData, setRangeData] = useState<any>(null);
	const [freqUnit, setFreqUnit] = useState<'Hz' | 'kHz' | 'MHz' | 'GHz'>('kHz');
	const [powerUnit] = useState<'dBm' | 'dBW'>('dBm');

	useEffect(() => {
		const fetchResults = async () => {
			try {
				setLoading(true);
				const res = await fetch('/api/results');
				if (!res.ok) throw new Error('No se pudieron obtener resultados');
				const json = await res.json();
				setData(json);
			} catch (e: any) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};
		fetchResults();
	}, []);

	// const fetchComparisonData = async () => {
	// 	try {
	// 		const res = await fetch('/api/compare');
	// 		if (res.ok) {
	// 			const json = await res.json();
	// 			setComparisonData(json.comparison);
	// 		}
	// 	} catch (e) {
	// 		console.error('Error fetching comparison data:', e);
	// 	}
	// };

	const fetchRangeData = async () => {
		if (!data) return;
		
		try {
			// Usar valores por defecto para la simulación de alcance
			const res = await fetch('/api/range', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					power: data.power_dbm ?? 30,
					frequency: data.frequency_hz ?? ((data.system === '5G' ? 2400 : data.system === '5G-A' ? 3500 : 6000) * 1e6),
					distance: data.distance_m ?? 1000,
					system: data.system || '5G',
					bandwidth_hz: data.bandwidth_hz ?? undefined,
				}),
			});
			if (res.ok) {
				const json = await res.json();
				setRangeData(json.range_data);
			} else {
				console.error('Error fetching range data:', res.status, res.statusText);
			}
		} catch (e) {
			console.error('Error fetching range data:', e);
		}
	};

	const handleCompareSystems = async () => {
		if (!data) return;
		
		try {
			const res = await fetch('/api/compare', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					power: data.power_dbm ?? 30,
					frequency: data.frequency_hz ?? ((data.system === '5G' ? 2400 : data.system === '5G-A' ? 3500 : 6000) * 1e6),
					distance: data.distance_m ?? 1000,
					system: data.system || '5G',
					bandwidth_hz: data.bandwidth_hz ?? undefined,
				}),
			});
			if (res.ok) {
				const json = await res.json();
				setComparisonData(json.comparison);
				setOpenComparison(true);
			} else {
				console.error('Error comparing systems:', res.status, res.statusText);
			}
		} catch (e) {
			console.error('Error comparing systems:', e);
		}
	};

	const unitScale = useMemo(() => ({
		'Hz': 1,
		'kHz': 1e-3,
		'MHz': 1e-6,
		'GHz': 1e-9,
	}), []);

	const formatFreq = (v: number) => `${Math.round(v * unitScale[freqUnit])} ${freqUnit}`;
	const formatPower = (dbm: number | null | undefined) => {
		if (dbm == null) return '-';
		return powerUnit === 'dBm' ? `${dbm.toFixed(2)} dBm` : `${(dbm - 30).toFixed(2)} dBW`;
	};

	const systemGainDb = useMemo(() => {
		if (!data?.system) return 0;
		if (data.system === '5G-A') return 3;
		if (data.system === '6G') return 6;
		return 0;
	}, [data?.system]);

	const linkBudget = useMemo(() => {
		if (!data) return null;
		const antennaGain = data.antenna?.antenna_gain_db ?? 0;
		const polLoss = data.antenna?.polarization_mismatch_loss_db ?? 0;
		const fspl = data.path_loss ?? 0;
		const pr = data.power_received ?? 0;
		const pt = pr + fspl - systemGainDb - antennaGain + polLoss;
		return {
			pt,
			systemGainDb,
			antennaGain,
			fspl,
			polLoss,
			pr,
		};
	}, [data, systemGainDb]);

	const linkBudgetBars = useMemo(() => {
		if (!linkBudget) return [] as any[];
		return [
			{ name: 'TX Power', value: linkBudget.pt },
			{ name: 'System Gain', value: linkBudget.systemGainDb },
			{ name: 'Antenna Gain', value: linkBudget.antennaGain },
			{ name: 'FSPL (loss)', value: -Math.abs(linkBudget.fspl) },
			{ name: 'Pol. Loss', value: -Math.abs(linkBudget.polLoss) },
			{ name: 'RX Power', value: linkBudget.pr },
		];
	}, [linkBudget]);

	const antennaPatterns = useMemo(() => {
		if (!data?.antenna) return null;
		const sampleAngles = Array.from({ length: 24 }, (_, i) => i * 15); // 0..345°
		const pattern = (hpbw: number) => {
			return sampleAngles.map((deg) => {
				const x = deg / (hpbw / 2);
				const gain = -12 * x * x; // dB
				return { angle: `${deg}°`, gain: Math.max(gain, -30) };
			});
		};
		return {
			tx: pattern(data.antenna.tx_beamwidth_deg),
			rx: pattern(data.antenna.rx_beamwidth_deg),
		};
	}, [data?.antenna]);

	const getSNRStatus = (snr: number | null) => {
		if (snr === null) return { status: 'unknown', color: 'text-white/60', bg: 'bg-white/10' };
		if (snr >= 20) return { status: 'excellent', color: 'text-accent-400', bg: 'bg-accent-500/20' };
		if (snr >= 10) return { status: 'good', color: 'text-primary-400', bg: 'bg-primary-500/20' };
		if (snr >= 5) return { status: 'fair', color: 'text-warning-400', bg: 'bg-warning-500/20' };
		return { status: 'poor', color: 'text-red-400', bg: 'bg-red-500/20' };
	};

	const MetricCard = ({ 
		title, 
		value, 
		unit, 
		icon: Icon, 
		color, 
		status,
		description 
	}: { 
		title: string; 
		value: string; 
		unit: string; 
		icon: any; 
		color: string; 
		status?: string;
		description?: string;
	}) => (
		<div className="metric-card group">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div className={`icon-wrapper ${color}`}>
						<Icon className="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-white">{title}</h3>
						{description && <p className="text-white/60 text-xs">{description}</p>}
					</div>
				</div>
				{status && (
					<div className={`px-2 py-1 rounded-lg text-xs font-medium ${status === 'excellent' ? 'bg-accent-500/20 text-accent-400' : 
						status === 'good' ? 'bg-primary-500/20 text-primary-400' : 
						status === 'fair' ? 'bg-warning-500/20 text-warning-400' : 
						'bg-red-500/20 text-red-400'}`}>
						{status === 'excellent' ? 'Excelente' : 
						 status === 'good' ? 'Bueno' : 
						 status === 'fair' ? 'Regular' : 'Pobre'}
					</div>
				)}
			</div>
			<div className="text-3xl font-bold text-white mb-2">{value}</div>
			<div className="text-white/60 text-sm">{unit}</div>
		</div>
	);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="flex items-center justify-center space-x-3">
					<div className="icon-wrapper gradient-primary">
						<BarChart3 className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl font-bold text-gradient">Análisis de Señal</h1>
				</div>
				<p className="text-white/70 text-lg max-w-3xl mx-auto">
					Resultados de la simulación: potencia recibida, SNR, pérdida de trayecto y análisis espectral. 
					Sistema: <span className="text-primary-400 font-semibold">{data?.system ?? 'N/A'}</span> · 
					Ancho de banda: <span className="text-accent-400 font-semibold">{data?.bandwidth_hz ? `${(data.bandwidth_hz/1e6).toFixed(0)} MHz` : 'N/A'}</span>
				</p>
			</div>

			{/* Error State */}
			{error && (
				<div className="glass-card-strong p-6 border-red-500/20">
					<div className="flex items-start space-x-3">
						<AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
						<div>
							<h3 className="text-lg font-semibold text-red-400 mb-2">Error al cargar resultados</h3>
							<p className="text-white/70">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="glass-card-strong p-8 text-center">
					<div className="flex items-center justify-center space-x-3">
						<RefreshCw className="w-6 h-6 text-primary-400 animate-spin" />
						<span className="text-white/70">Cargando resultados de la simulación...</span>
					</div>
				</div>
			)}

			{/* No Data State */}
			{!loading && !error && !data && (
				<div className="glass-card-strong p-8 text-center">
					<div className="flex flex-col items-center space-y-4">
						<div className="icon-wrapper bg-white/10">
							<Info className="w-8 h-8 text-white/60" />
						</div>
						<div>
							<h3 className="text-xl font-semibold text-white mb-2">No hay datos disponibles</h3>
							<p className="text-white/70">Ejecuta una simulación desde la vista de configuración para ver los resultados aquí.</p>
						</div>
					</div>
				</div>
			)}

			{/* Results */}
			{data && (
				<>
					{/* Metrics Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<MetricCard
							title="Potencia Recibida"
							value={formatPower(data.power_received)}
							unit=""
							icon={Zap}
							color="bg-gradient-to-r from-accent-500 to-accent-600"
							description="Potencia de la señal en el receptor"
						/>
						<MetricCard
							title="Relación Señal-Ruido"
							value={data.snr?.toFixed(2) ?? '-'}
							unit="dB"
							icon={TrendingUp}
							color="bg-gradient-to-r from-primary-500 to-primary-600"
							status={getSNRStatus(data.snr).status}
							description="Calidad de la señal recibida"
						/>
						<MetricCard
							title="Pérdida de Trayecto (FSPL)"
							value={data.path_loss?.toFixed(2) ?? '-'}
							unit="dB"
							icon={Activity}
							color="bg-gradient-to-r from-secondary-500 to-secondary-600"
							description="Atenuación por espacio libre"
						/>
					</div>

				{/* Antenna Summary */}
				{data.antenna && (
					<div className="glass-card-strong p-8">
						<div className="flex items-center space-x-3 mb-6">
							<div className="icon-wrapper gradient-accent">
								<Target className="w-6 h-6 text-white" />
							</div>
							<h2 className="text-2xl font-bold text-white">Antenas y Ganancias</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="metric-card">
								<div className="text-primary-400 text-sm font-medium">Ganancia total de antenas</div>
								<div className="text-3xl font-bold text-white">{data.antenna.antenna_gain_db.toFixed(2)} dB</div>
								<div className="text-white/60 text-sm">TX + RX (dBi)</div>
							</div>
							<div className="metric-card">
								<div className="text-warning-400 text-sm font-medium">Pérdida por polarización</div>
								<div className="text-3xl font-bold text-white">{data.antenna.polarization_mismatch_loss_db.toFixed(1)} dB</div>
								<div className="text-white/60 text-sm">0 dB si coincide, 20 dB si ortogonal</div>
							</div>
							<div className="metric-card">
								<div className="text-accent-400 text-sm font-medium">Sistema</div>
								<div className="text-3xl font-bold text-white">{data.system ?? '-'}</div>
								<div className="text-white/60 text-sm">Contexto de simulación</div>
							</div>
						</div>

						{linkBudget && (
							<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="glass-card p-4">
									<div className="text-white font-semibold mb-3">Presupuesto de Enlace</div>
									<div className="h-64">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={linkBudgetBars}>
												<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
												<XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
												<YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} tickFormatter={(v) => `${v} dB`} />
												<Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px' }} />
												<Bar dataKey="value" fill="#22c55e" name="dB" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>
								{antennaPatterns && (
									<div className="glass-card p-4">
										<div className="text-white font-semibold mb-3">Patrón de Antenas (idealizado)</div>
										<div className="h-64">
											<ResponsiveContainer width="100%" height="100%">
												<RadarChart data={antennaPatterns.tx} outerRadius="80%">
													<PolarGrid />
													<PolarAngleAxis dataKey="angle" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
													<Radar name="TX" dataKey="gain" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
												</RadarChart>
											</ResponsiveContainer>
										</div>
										<div className="h-64 mt-4">
											<ResponsiveContainer width="100%" height="100%">
												<RadarChart data={antennaPatterns.rx} outerRadius="80%">
													<PolarGrid />
													<PolarAngleAxis dataKey="angle" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
													<Radar name="RX" dataKey="gain" stroke="#34d399" fill="#34d399" fillOpacity={0.4} />
												</RadarChart>
											</ResponsiveContainer>
										</div>
									</div>
								)}
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
							<div className="glass-card p-4">
								<div className="text-purple-300 text-sm font-medium mb-1">Antena TX</div>
								<div className="text-white">{data.antenna.tx_gain_dbi} dBi • {data.antenna.tx_polarization} • {data.antenna.tx_beamwidth_deg}°</div>
							</div>
							<div className="glass-card p-4">
								<div className="text-emerald-300 text-sm font-medium mb-1">Antena RX</div>
								<div className="text-white">{data.antenna.rx_gain_dbi} dBi • {data.antenna.rx_polarization} • {data.antenna.rx_beamwidth_deg}°</div>
							</div>
						</div>
					</div>
				)}

				{/* Spectrum Analysis */}
				<div className="glass-card-strong p-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="icon-wrapper gradient-secondary">
								<Wifi className="w-6 h-6 text-white" />
							</div>
							<h2 className="text-2xl font-bold text-white">Análisis Espectral (FFT)</h2>
						</div>
						<div className="flex items-center space-x-3">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-white/70">Unidad:</span>
								<div className="flex gap-1">
									{(['Hz','kHz','MHz','GHz'] as const).map(u => (
										<button 
											key={u} 
											onClick={() => setFreqUnit(u)} 
											className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
												freqUnit === u 
													? 'bg-primary-600 text-white' 
													: 'bg-white/10 text-white/70 hover:bg-white/20'
											}`}
										>
											{u}
										</button>
									))}
								</div>
							</div>
							<button 
								onClick={() => setOpenSpectrum(true)} 
								className="btn-primary flex items-center space-x-2"
							>
								<Maximize2 className="w-4 h-4" />
								<span>Pantalla completa</span>
							</button>
						</div>
					</div>
					<div className="h-96 rounded-xl overflow-hidden">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={data.spectrum} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
								<XAxis 
									dataKey="freq" 
									type="number"
									domain={["dataMin", "dataMax"]}
									tickCount={8}
									tick={{ fill: '#cbd5e1', fontSize: 12 }} 
									tickFormatter={(v) => formatFreq(v)} 
								/>
								<YAxis 
									domain={["dataMin", "dataMax"]}
									tickCount={6}
									tick={{ fill: '#cbd5e1', fontSize: 12 }} 
									tickFormatter={(v) => `${v} dB`} 
								/>
								<Tooltip 
									contentStyle={{ 
										background: 'rgba(15, 23, 42, 0.95)', 
										border: '1px solid rgba(255,255,255,0.2)', 
										color: '#fff',
										borderRadius: '12px',
									}} 
									formatter={(value: number) => [`${value.toFixed(2)} dB`, 'Magnitud']}
									labelFormatter={(label: number) => `f = ${formatFreq(label)}`}
								/>
								<Area 
									type="monotone" 
									dataKey="magnitude" 
									stroke="url(#colorGradient)" 
									fill="url(#colorGradient)" 
									fillOpacity={0.3}
									strokeWidth={2}
								/>
								<defs>
									<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#3b82f6" />
										<stop offset="100%" stopColor="#1d4ed8" />
									</linearGradient>
								</defs>
								<Brush dataKey="freq" height={20} stroke="#64748b" travellerWidth={8}
									tickFormatter={() => ''} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
						<div className="flex items-start space-x-3">
							<Info className="w-5 h-5 text-primary-400 mt-0.5" />
							<div className="text-sm text-white/70">
								<strong>Análisis FFT:</strong> La transformada rápida de Fourier muestra la distribución 
								espectral de la señal. Los picos indican componentes de frecuencia dominantes.
							</div>
						</div>
					</div>
				</div>

					{/* Signal Range Chart */}
					{rangeData && (
						<div className="glass-card-strong p-8">
							<div className="flex items-center space-x-3 mb-6">
								<div className="icon-wrapper gradient-accent">
									<Target className="w-6 h-6 text-white" />
								</div>
								<h2 className="text-2xl font-bold text-white">Alcance de Señal</h2>
							</div>
							<div className="h-96">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={rangeData}>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
										<XAxis 
											dataKey="distance" 
											tick={{ fill: '#cbd5e1', fontSize: 12 }}
											tickFormatter={(v) => `${(v / 1000).toFixed(1)} km`}
											label={{ value: 'Distancia', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
										/>
										<YAxis 
											tick={{ fill: '#cbd5e1', fontSize: 12 }}
											tickFormatter={(v) => `${v} dBm`}
											label={{ value: 'Potencia Recibida', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
										/>
										<Tooltip 
											contentStyle={{ 
												background: 'rgba(15, 23, 42, 0.95)', 
												border: '1px solid rgba(255,255,255,0.2)', 
												color: '#fff',
												borderRadius: '12px'
											}}
											formatter={(value: number) => [`${value.toFixed(2)} dBm`, 'Potencia Recibida']}
											labelFormatter={(label) => `Distancia: ${(label / 1000).toFixed(1)} km`}
										/>
										<Line 
											type="monotone" 
											dataKey="power_received" 
											stroke="#3b82f6" 
											strokeWidth={3}
											dot={false}
											name="Potencia Recibida"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}

					{/* Action Buttons removed from here to be rendered outside the conditional */}
				</>
			)}

				{/* Full Screen Spectrum Modal */}
				<Modal open={openSpectrum} onClose={() => setOpenSpectrum(false)} title="Análisis Espectral Completo">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-white/70">Unidad de frecuencia:</span>
								<div className="flex gap-1">
									{(['Hz','kHz','MHz','GHz'] as const).map(u => (
										<button 
											key={u} 
											onClick={() => setFreqUnit(u)} 
											className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
												freqUnit === u 
													? 'bg-primary-600 text-white' 
													: 'bg-white/10 text-white/70 hover:bg-white/20'
											}`}
										>
											{u}
										</button>
									))}
								</div>
							</div>
						</div>
						<div className="h-[70vh] rounded-xl overflow-hidden">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={data?.spectrum ?? []} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
									<XAxis 
										dataKey="freq" 
										type="number"
										domain={["dataMin", "dataMax"]}
										tickCount={10}
										tick={{ fill: '#cbd5e1', fontSize: 14 }} 
										tickFormatter={(v) => formatFreq(v)} 
									/>
									<YAxis 
										domain={["dataMin", "dataMax"]}
										tickCount={8}
										tick={{ fill: '#cbd5e1', fontSize: 14 }} 
										tickFormatter={(v) => `${v} dB`} 
									/>
									<Tooltip 
										contentStyle={{ 
											background: 'rgba(15, 23, 42, 0.95)', 
											border: '1px solid rgba(255,255,255,0.2)', 
											color: '#fff',
											borderRadius: '12px',
											backdropFilter: 'blur(10px)'
										}} 
										formatter={(value: number) => [`${value.toFixed(2)} dB`, 'Magnitud']}
										labelFormatter={(label: number) => `f = ${formatFreq(label)}`}
									/>
									<Area 
										type="monotone" 
										dataKey="magnitude" 
										stroke="url(#colorGradient)" 
										fill="url(#colorGradient)" 
										fillOpacity={0.3}
										strokeWidth={3}
									/>
									<defs>
										<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#3b82f6" />
											<stop offset="100%" stopColor="#1d4ed8" />
										</linearGradient>
									</defs>
									<Brush dataKey="freq" height={24} stroke="#64748b" travellerWidth={10}
										tickFormatter={() => ''} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</Modal>

				{/* Comparison Modal */}
				<ComparisonModal 
					open={openComparison} 
					onClose={() => setOpenComparison(false)} 
					comparisonData={comparisonData}
				/>

				{/* Always-visible Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button 
						onClick={handleCompareSystems}
						disabled={!data}
						className={`btn-primary flex items-center justify-center space-x-2 ${!data ? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						<GitCompare className="w-5 h-5" />
						<span>Comparar Sistemas</span>
					</button>
					<button 
						onClick={fetchRangeData}
						disabled={!data}
						className={`btn-secondary flex items-center justify-center space-x-2 ${!data ? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						<Target className="w-5 h-5" />
						<span>Ver Alcance</span>
					</button>
					<button 
						disabled={!data}
						className={`btn-accent flex items-center justify-center space-x-2 ${!data ? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						<Download className="w-5 h-5" />
						<span>Exportar Datos</span>
					</button>
				</div>
			</div>
		);
	}