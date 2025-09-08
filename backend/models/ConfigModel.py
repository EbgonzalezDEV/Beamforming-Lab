from pydantic import BaseModel, Field
from typing import Literal


class ConfigModel(BaseModel):
	power: float = Field(..., description="Transmit power in dBm", ge=0, le=50)
	frequency: float = Field(..., description="Carrier frequency in Hz", gt=0)
	distance: float = Field(..., description="Distance in meters", gt=0)
	system: Literal['5G', '5G-A', '6G'] = Field('5G', description='Communication system')
