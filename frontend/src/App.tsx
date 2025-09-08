import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ConfigView } from './views/ConfigView';
import { ResultsView } from './views/ResultsView';
import SignalAnalysisView from './views/SignalAnalysisView';
import { ConfigModel } from './models/ConfigModel';
import { ResultsModel } from './models/ResultsModel';

function Shell() {
	const [results, setResults] = useState<ResultsModel | null>(null);
	const navigate = useNavigate();

	const handleRunSimulation = async (config: ConfigModel) => {
		try {
			await fetch('/api/config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					power: config.power,
					frequency: config.frequency * 1e6,
					distance: config.distance,
					system: config.system,
				}),
			});
			navigate('/analysis');
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="App min-h-screen bg-slate-900">
			<header className="bg-slate-800 border-b border-slate-700 shadow-lg">
				<div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold text-white">Beamforming Lab</h1>
					<nav className="space-x-4">
						<Link className="text-slate-300 hover:text-white" to="/">Config</Link>
						<Link className="text-slate-300 hover:text-white" to="/analysis">Análisis</Link>
					</nav>
				</div>
			</header>
			<main>
				<Routes>
					<Route path="/" element={<ConfigView onRunSimulation={handleRunSimulation} isLoading={false} />} />
					<Route path="/results" element={results ? <ResultsView results={results} onBackToConfig={() => {}} /> : <div className="text-white p-6">No hay resultados</div>} />
					<Route path="/analysis" element={<SignalAnalysisView />} />
				</Routes>
			</main>
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Shell />
		</BrowserRouter>
	);
}
