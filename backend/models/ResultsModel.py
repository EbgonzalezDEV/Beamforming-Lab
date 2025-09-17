from pydantic import BaseModel
from typing import List, Optional, Literal


class SpectrumPoint(BaseModel):
	freq: float
	magnitude: float


class AntennaResult(BaseModel):
	tx_gain_dbi: float
	rx_gain_dbi: float
	tx_polarization: Literal['H', 'V']
	rx_polarization: Literal['H', 'V']
	tx_beamwidth_deg: float
	rx_beamwidth_deg: float
	polarization_mismatch_loss_db: float
	antenna_gain_db: float


class ResultsModel(BaseModel):
	power_received: Optional[float]
	snr: Optional[float]
	path_loss: Optional[float]
	spectrum: List[SpectrumPoint]
	system: Optional[str]
	bandwidth_hz: Optional[float] = None
	antenna: Optional[AntennaResult] = None
	range: Optional[float] = None
	# Echo back input parameters for frontend reuse
	power_dbm: Optional[float] = None
	frequency_hz: Optional[float] = None
	distance_m: Optional[float] = None

