import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
	const [powerUnit, setPowerUnit] = useState<'dBm' | 'dBW'>('dBm');

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

	return (
		<div className="text-white p-1 md:p-2">
			<div className="max-w-7xl mx-auto space-y-6">
				<h1 className="text-2xl md:text-3xl font-bold">Análisis de Señal</h1>
				<p className="text-slate-300 text-sm">Resultados: potencia recibida, SNR, FSPL y espectro. Sistema: {data?.system ?? '-'} · B = {data?.bandwidth_hz ? `${(data.bandwidth_hz/1e6).toFixed(0)} MHz` : '-'}</p>

				{error && <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">{error}</div>}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Métricas */}
					<div className="space-y-4">
						<div className="bg-slate-800 rounded-xl shadow p-5 border border-slate-700">
							<h2 className="text-xl font-semibold mb-3">Métricas</h2>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm text-slate-300">Unidades potencia:</h3>
								<div className="flex gap-2">
									{(['dBm','dBW'] as const).map(u => (
										<button key={u} onClick={() => setPowerUnit(u)} className={`px-2 py-1 rounded-md text-xs border ${powerUnit===u?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'}`}>{u}</button>
									))}
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-slate-700 rounded-lg p-4">
									<div className="text-slate-300 text-sm">Potencia recibida</div>
									<div className="text-2xl font-semibold">{formatPower(data?.power_received)}</div>
								</div>
								<div className="bg-slate-700 rounded-lg p-4">
									<div className="text-slate-300 text-sm">SNR</div>
									<div className="text-2xl font-semibold">{data?.snr?.toFixed(2) ?? '-'} dB</div>
								</div>
								<div className="bg-slate-700 rounded-lg p-4">
									<div className="text-slate-300 text-sm">Pérdida (FSPL)</div>
									<div className="text-2xl font-semibold">{data?.path_loss?.toFixed(2) ?? '-'} dB</div>
								</div>
							</div>
						</div>
					</div>

					{/* Espectro */}
					<div className="bg-slate-800 rounded-xl shadow p-5 border border-slate-700">
						<h2 className="text-xl font-semibold mb-3">Espectro (FFT)</h2>
						<div className="flex items-center justify-between mb-3">
							<div className="text-sm text-slate-300">Unidad de frecuencia:</div>
							<div className="flex gap-2">
								{(['Hz','kHz','MHz','GHz'] as const).map(u => (
									<button key={u} onClick={() => setFreqUnit(u)} className={`px-2 py-1 rounded-md text-xs border ${freqUnit===u?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'}`}>{u}</button>
								))}
							</div>
							<button onClick={() => setOpenSpectrum(true)} className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Ver en grande</button>
						</div>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={data?.spectrum ?? []}>
									<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
									<XAxis dataKey="freq" tick={{ fill: '#cbd5e1' }} tickFormatter={(v) => formatFreq(v)} />
									<YAxis tick={{ fill: '#cbd5e1' }} tickFormatter={(v) => `${v} dB`} />
									<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
									<Area type="monotone" dataKey="magnitude" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.2} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{loading && <div className="text-slate-300">Cargando resultados...</div>}

				{!loading && !error && !data && (
					<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
						Ejecuta una simulación desde la vista de configuración para ver resultados aquí.
					</div>
				)}
			</div>
		
			<Modal open={openSpectrum} onClose={() => setOpenSpectrum(false)} title="Espectro (FFT)">
				<div className="flex items-center justify-between mb-3">
					<div className="text-sm text-slate-300">Unidad de frecuencia:</div>
					<div className="flex gap-2">
						{(['Hz','kHz','MHz','GHz'] as const).map(u => (
							<button key={u} onClick={() => setFreqUnit(u)} className={`px-2 py-1 rounded-md text-xs border ${freqUnit===u?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'}`}>{u}</button>
						))}
					</div>
				</div>
				<div className="h-[70vh]">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data?.spectrum ?? []}>
							<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
							<XAxis dataKey="freq" tick={{ fill: '#cbd5e1' }} tickFormatter={(v) => formatFreq(v)} />
							<YAxis tick={{ fill: '#cbd5e1' }} tickFormatter={(v) => `${v} dB`} />
							<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
							<Area type="monotone" dataKey="magnitude" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.2} />
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</Modal>
		</div>
	);
}
