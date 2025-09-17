import numpy as np
from scipy.fft import rfft, rfftfreq
from typing import Dict, List, Any


class SignalService:
	def __init__(self) -> None:
		self._last_results = None
		self._comparison_data = {}

	@staticmethod
	def fspl(distance_m: float, frequency_hz: float) -> float:
		c = 299_792_458.0
		wavelength = c / frequency_hz
		return 20 * np.log10(4 * np.pi * distance_m / wavelength)

	def simulate(self, power_dbm: float, frequency_hz: float, distance_m: float, system: str = '5G',
				tx_gain_dbi: float = 0.0, rx_gain_dbi: float = 0.0,
				tx_polarization: str = 'H', rx_polarization: str = 'H',
				tx_beamwidth_deg: float = 65.0, rx_beamwidth_deg: float = 65.0):
		fspl_db = float(self.fspl(distance_m, frequency_hz))
		power_tx_dbm = float(power_dbm)

		# Suposiciones basadas en los documentos: diferente B segun sistema (aprox.)
		bandwidth_map = {
			'5G': 20e6,   # 20 MHz
			'5G-A': 80e6, # 80 MHz (carrier aggregation / mejoras)
			'6G': 200e6,  # 200 MHz (ultra wideband)
		}
		bandwidth_hz = float(bandwidth_map.get(system, 20e6))

		# Ganancia efectiva del sistema por mejoras
		system_gain = 0.0
		if system == '5G-A':
			system_gain = 3.0
		elif system == '6G':
			system_gain = 6.0

		# Ganancia de antenas: suma de dBi de TX y RX
		antenna_gain_db = float(tx_gain_dbi + rx_gain_dbi)

		# Pérdida por desajuste de polarización (simplificado): 0 dB si igual, 20 dB si ortogonal
		polarization_mismatch_loss_db = 0.0 if tx_polarization == rx_polarization else 20.0

		# Penalización por ancho de haz (opcional y simple): cuanto más estrecho, mayor ganancia direccional efectiva
		# Aquí no aplicamos penalización adicional porque la ganancia ya debe reflejarlo en dBi del usuario.

		power_rx_dbm = float(power_tx_dbm - fspl_db + system_gain + antenna_gain_db - polarization_mismatch_loss_db)

		# Ruido: kTB en dBm = -174 dBm/Hz + 10*log10(B) + NF
		noise_figure_db = 5.0
		noise_floor_dbm = -174.0 + 10 * np.log10(bandwidth_hz) + noise_figure_db
		snr_db = float(power_rx_dbm - noise_floor_dbm)

		# Simulación en banda base: tono bajo (por ejemplo 10 kHz) + ruido ajustado a la SNR
		baseband_tone_hz = 10_000.0
		duration_s = 0.02
		sample_rate = 500_000  # 500 kHz para representar bien 10 kHz
		t = np.arange(0, duration_s, 1 / sample_rate)

		# Ajuste de amplitudes relativas según SNR: SNR_linear = (A_s^2)/(A_n^2)
		snr_linear = 10 ** (snr_db / 10)
		amplitude_signal = 1.0
		amplitude_noise = np.sqrt(amplitude_signal ** 2 / snr_linear)

		signal = amplitude_signal * np.sin(2 * np.pi * baseband_tone_hz * t)
		noise = np.random.normal(0, amplitude_noise, size=t.shape)
		received = signal + noise

		y = rfft(received)
		freqs = rfftfreq(received.size, 1 / sample_rate)
		mag = 20 * np.log10(np.abs(y) + 1e-12)

		spectrum = []
		for f, m in zip(freqs.tolist(), mag.tolist()):
			spectrum.append({"freq": f, "magnitude": m})

		self._last_results = {
			"power_received": power_rx_dbm,
			"snr": snr_db,
			"path_loss": fspl_db,
			"spectrum": spectrum[:2000],
			"system": system,
			"bandwidth_hz": bandwidth_hz,
			"antenna": {
				"tx_gain_dbi": tx_gain_dbi,
				"rx_gain_dbi": rx_gain_dbi,
				"tx_polarization": tx_polarization,
				"rx_polarization": rx_polarization,
				"tx_beamwidth_deg": tx_beamwidth_deg,
				"rx_beamwidth_deg": rx_beamwidth_deg,
				"polarization_mismatch_loss_db": polarization_mismatch_loss_db,
				"antenna_gain_db": antenna_gain_db
			}
		}
		return self._last_results

	def last_results(self):
		return self._last_results or {
			"power_received": None,
			"snr": None,
			"path_loss": None,
			"spectrum": [],
			"system": None,
			"bandwidth_hz": None,
		}

	def generate_signal_range_data(self, power_dbm: float, frequency_hz: float, system: str = '5G') -> List[Dict[str, Any]]:
		"""Genera datos de alcance de señal para diferentes distancias"""
		distances = np.linspace(100, 10000, 50)  # 100m a 10km
		range_data = []
		
		bandwidth_map = {
			'5G': 20e6,
			'5G-A': 80e6,
			'6G': 200e6,
		}
		bandwidth_hz = bandwidth_map.get(system, 20e6)
		
		# Ganancia del sistema
		system_gain = 0.0
		if system == '5G-A':
			system_gain = 3.0
		elif system == '6G':
			system_gain = 6.0
		
		for distance in distances:
			fspl_db = float(self.fspl(distance, frequency_hz))
			power_rx_dbm = float(power_dbm - fspl_db + system_gain)
			
			# Ruido
			noise_figure_db = 5.0
			noise_floor_dbm = -174.0 + 10 * np.log10(bandwidth_hz) + noise_figure_db
			snr_db = float(power_rx_dbm - noise_floor_dbm)
			
			range_data.append({
				"distance": float(distance),
				"power_received": power_rx_dbm,
				"snr": snr_db,
				"path_loss": fspl_db
			})
		
		return range_data

	def compare_all_systems(self, power_dbm: float, frequency_hz: float, distance_m: float) -> Dict[str, Any]:
		"""Compara los 3 sistemas (5G, 5G-A, 6G) con los mismos parámetros"""
		systems = ['5G', '5G-A', '6G']
		comparison_results = {}
		
		for system in systems:
			results = self.simulate(power_dbm, frequency_hz, distance_m, system)
			comparison_results[system] = {
				"power_received": results["power_received"],
				"snr": results["snr"],
				"path_loss": results["path_loss"],
				"bandwidth_hz": results["bandwidth_hz"],
				"system_gain": 3.0 if system == '5G-A' else (6.0 if system == '6G' else 0.0)
			}
		
		# Generar datos de alcance para cada sistema
		range_comparison = {}
		for system in systems:
			range_comparison[system] = self.generate_signal_range_data(power_dbm, frequency_hz, system)
		
		self._comparison_data = {
			"systems": comparison_results,
			"range_data": range_comparison,
			"parameters": {
				"power_dbm": power_dbm,
				"frequency_hz": frequency_hz,
				"distance_m": distance_m
			}
		}
		
		return self._comparison_data

	def get_comparison_data(self):
		"""Obtiene los datos de comparación almacenados"""
		return self._comparison_data or {}
