import numpy as np
from scipy.fft import rfft, rfftfreq


class SignalService:
	def __init__(self) -> None:
		self._last_results = None

	@staticmethod
	def fspl(distance_m: float, frequency_hz: float) -> float:
		c = 299_792_458.0
		wavelength = c / frequency_hz
		return 20 * np.log10(4 * np.pi * distance_m / wavelength)

	def simulate(self, power_dbm: float, frequency_hz: float, distance_m: float, system: str = '5G'):
		fspl_db = float(self.fspl(distance_m, frequency_hz))
		power_tx_dbm = float(power_dbm)

		# Suposiciones basadas en los documentos: diferente B segun sistema (aprox.)
		bandwidth_map = {
			'5G': 20e6,   # 20 MHz
			'5G-A': 80e6, # 80 MHz (carrier aggregation / mejoras)
			'6G': 200e6,  # 200 MHz (ultra wideband)
		}
		bandwidth_hz = float(bandwidth_map.get(system, 20e6))

		# Ganancia efectiva del sistema por beamforming/mejoras
		system_gain = 0.0
		if system == '5G-A':
			system_gain = 3.0
		elif system == '6G':
			system_gain = 6.0

		power_rx_dbm = float(power_tx_dbm - fspl_db + system_gain)

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
