from fastapi import APIRouter
from models.ConfigModel import ConfigModel
from models.ResultsModel import ResultsModel
from services.SignalService import SignalService

router = APIRouter(prefix="/api", tags=["signal"])
_service = SignalService()


@router.post("/config")
def configure(config: ConfigModel):
    results = _service.simulate(
        power_dbm=config.power,
        frequency_hz=config.frequency,
        distance_m=config.distance,
        system=config.system,
        tx_gain_dbi=config.tx_antenna.gain_dbi,
        rx_gain_dbi=config.rx_antenna.gain_dbi,
        tx_polarization=config.tx_antenna.polarization,
        rx_polarization=config.rx_antenna.polarization,
        tx_beamwidth_deg=config.tx_antenna.beamwidth_deg,
        rx_beamwidth_deg=config.rx_antenna.beamwidth_deg,
    )
    return {"status": "ok", "results": results}


@router.get("/results", response_model=ResultsModel)
def get_results() -> ResultsModel:
	return ResultsModel(**_service.last_results())


@router.post("/compare")
def compare_systems(config: ConfigModel):
	"""Compara los 3 sistemas con los mismos parámetros"""
	comparison_data = _service.compare_all_systems(
		power_dbm=config.power,
		frequency_hz=config.frequency,
		distance_m=config.distance
	)
	return {"status": "ok", "comparison": comparison_data}


@router.get("/compare")
def get_comparison():
	"""Obtiene los datos de comparación almacenados"""
	comparison_data = _service.get_comparison_data()
	return {"status": "ok", "comparison": comparison_data}


@router.post("/range")
def get_signal_range(config: ConfigModel):
	"""Obtiene datos de alcance de señal para el sistema especificado"""
	range_data = _service.generate_signal_range_data(
		power_dbm=config.power,
		frequency_hz=config.frequency,
		system=config.system
	)
	return {"status": "ok", "range_data": range_data}
