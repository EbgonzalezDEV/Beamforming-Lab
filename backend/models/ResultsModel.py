from pydantic import BaseModel
from typing import List, Optional


class SpectrumPoint(BaseModel):
	freq: float
	magnitude: float


class ResultsModel(BaseModel):
	power_received: Optional[float]
	snr: Optional[float]
	path_loss: Optional[float]
	spectrum: List[SpectrumPoint]
	system: Optional[str]


