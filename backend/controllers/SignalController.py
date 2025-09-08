from fastapi import APIRouter
from ..models.ConfigModel import ConfigModel
from ..models.ResultsModel import ResultsModel
from ..services.SignalService import SignalService

router = APIRouter(prefix="/api", tags=["signal"])
_service = SignalService()


@router.post("/config")
def configure(config: ConfigModel):
	results = _service.simulate(
		power_dbm=config.power,
		frequency_hz=config.frequency,
		distance_m=config.distance,
		system=config.system,
	)
	return {"status": "ok", "results": results}


@router.get("/results", response_model=ResultsModel)
def get_results() -> ResultsModel:
	return ResultsModel(**_service.last_results())
