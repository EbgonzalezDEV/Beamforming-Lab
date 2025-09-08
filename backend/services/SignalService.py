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

		# Ajuste simple por sistema (ejemplo): 5G-A +3 dB, 6G +6 dB de mejora efectiva
		system_gain = 0.0
		if system == '5G-A':
			system_gain = 3.0
		elif system == '6G':
			system_gain = 6.0

		power_rx_dbm = float(power_tx_dbm - fspl_db + system_gain)

		noise_floor_dbm = -100.0
		snr_db = float(power_rx_dbm - noise_floor_dbm)

		duration_s = 0.01
		sample_rate = 100_000
		t = np.arange(0, duration_s, 1 / sample_rate)
		amplitude = 1.0
		signal = amplitude * np.sin(2 * np.pi * frequency_hz * t)
		noise = np.random.normal(0, 0.1, size=t.shape)
		received = signal * 10 ** (power_rx_dbm / 20) + noise

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
		}
		return self._last_results

	def last_results(self):
		return self._last_results or {
			"power_received": None,
			"snr": None,
			"path_loss": None,
			"spectrum": [],
			"system": None,
		}
