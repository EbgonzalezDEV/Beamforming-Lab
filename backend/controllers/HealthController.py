from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter(prefix="", tags=["health"]) 

class HealthResponse(BaseModel):
	status: Literal["ok"]
	service: str
	version: str | None = None

@router.get("/health", response_model=HealthResponse, summary="Service health check")
async def health() -> HealthResponse:
	return HealthResponse(status="ok", service="beamforming-backend", version=None)

