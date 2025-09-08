import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ConfigView } from './views/ConfigView';
import SignalAnalysisView from './views/SignalAnalysisView';
import { ConfigModel } from './models/ConfigModel';
import Layout from './components/Layout';

function Shell() {
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
		<Layout>
			<Routes>
				<Route path="/" element={<ConfigView onRunSimulation={handleRunSimulation} isLoading={false} />} />
				<Route path="/analysis" element={<SignalAnalysisView />} />
			</Routes>
		</Layout>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Shell />
		</BrowserRouter>
	);
}
