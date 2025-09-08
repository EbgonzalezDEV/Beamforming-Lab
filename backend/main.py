from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.SignalController import router as signal_router

app = FastAPI(title="Beamforming Lab API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"]
	,
	allow_headers=["*"]
)

app.include_router(signal_router)


@app.get("/")
async def root():
	return {"message": "Beamforming Lab API running"}
