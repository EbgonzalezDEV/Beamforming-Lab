import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  Share2
} from 'lucide-react';
import Modal from '../components/Modal';

interface SpectrumPoint { freq: number; magnitude: number }
interface ResultsDto {
	power_received: number | null;
	snr: number | null;
	path_loss: number | null;
	spectrum: SpectrumPoint[];
	system?: string | null;
	bandwidth_hz?: number | null;
}

export default function SignalAnalysisView() {
	const [data, setData] = useState<ResultsDto | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [openSpectrum, setOpenSpectrum] = useState(false);
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
							title="Pérdida de Trayecto"
							value={data.path_loss?.toFixed(2) ?? '-'}
							unit="dB"
							icon={Activity}
							color="bg-gradient-to-r from-secondary-500 to-secondary-600"
							description="Atenuación por espacio libre"
						/>
					</div>

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
								<AreaChart data={data.spectrum}>
									<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
									<XAxis 
										dataKey="freq" 
										tick={{ fill: '#cbd5e1', fontSize: 12 }} 
										tickFormatter={(v) => formatFreq(v)} 
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
											borderRadius: '12px',
											backdropFilter: 'blur(10px)'
										}} 
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

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="btn-secondary flex items-center justify-center space-x-2">
							<Download className="w-5 h-5" />
							<span>Exportar Datos</span>
						</button>
						<button className="btn-accent flex items-center justify-center space-x-2">
							<Share2 className="w-5 h-5" />
							<span>Compartir Resultados</span>
						</button>
					</div>
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
							<AreaChart data={data?.spectrum ?? []}>
								<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
								<XAxis 
									dataKey="freq" 
									tick={{ fill: '#cbd5e1', fontSize: 14 }} 
									tickFormatter={(v) => formatFreq(v)} 
								/>
								<YAxis 
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
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</Modal>
		</div>
	);
}
