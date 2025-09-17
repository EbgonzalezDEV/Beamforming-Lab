from pydantic import BaseModel, Field
from typing import Literal, Optional


class AntennaConfig(BaseModel):
	gain_dbi: float = Field(0.0, description="Antenna gain in dBi", ge=-10, le=30)
	polarization: Literal['H', 'V'] = Field('H', description='Antenna polarization (Horizontal or Vertical)')
	beamwidth_deg: float = Field(65.0, description='Half-power beamwidth in degrees', gt=0, le=360)


class ConfigModel(BaseModel):
	power: float = Field(..., description="Transmit power in dBm", ge=0, le=50)
	frequency: float = Field(..., description="Carrier frequency in Hz", gt=0)
	distance: float = Field(..., description="Distance in meters", gt=0)
	system: Literal['5G', '5G-A', '6G'] = Field('5G', description='Communication system')
	# Antennas: transmitter and receiver
	tx_antenna: AntennaConfig = Field(default_factory=AntennaConfig, description='Transmitter antenna configuration')
	rx_antenna: AntennaConfig = Field(default_factory=AntennaConfig, description='Receiver antenna configuration')
