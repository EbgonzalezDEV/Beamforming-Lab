# Beamforming Lab

Entorno de simulación (MVC en frontend) + API backend (FastAPI) para análisis de señal 5G/5G-A/6G.

## Requisitos
- Node.js 20+
- Python 3.12+
- PowerShell (Windows)

## Estructura
```
backend/
  main.py
  controllers/SignalController.py
  models/ConfigModel.py
  services/SignalService.py
src/
  models/, views/, controllers/
  views/SignalAnalysisView.tsx
  App.tsx
```

## Backend (FastAPI)

1) Crear/activar el entorno e instalar dependencias (usa el requirements.txt del backend):
```powershell
python -m venv venv
venv\Scripts\python -m pip install --upgrade pip
venv\Scripts\pip install -r backend/requirements.txt
```

2) Ejecutar el backend (desde la carpeta raíz del proyecto):
```powershell
venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
```

Endpoints:
- POST http://localhost:8000/api/config
```json
{ "power": 10, "frequency": 3.5e9, "distance": 100 }
```
- GET http://localhost:8000/api/results

## Frontend (React + TS + Vite)

1) Instalar dependencias (si no lo hiciste):
```powershell
npm install
```

2) Ejecutar el frontend:
```powershell
npm run dev
```
Vite mostrará la URL, por ejemplo `http://localhost:5173`.

## Flujo de uso
1. Ir a la ruta "Config" (inicio), configurar potencia (dBm), frecuencia (MHz) y distancia (m).
2. Al pulsar "Ejecutar Simulación" se envían los datos a `POST /api/config`.
3. Navegar automáticamente a "Análisis".
4. En "Análisis" (SignalAnalysisView) se consume `GET /api/results` y se muestran:
   - Tabla de métricas: Potencia recibida (dBm), SNR (dB), Path Loss (dB).
   - Gráfico del espectro (FFT) con Recharts.

## Estilo
- Fondo laboratorio `bg-slate-900`.
- Tarjetas con `bg-slate-800`, bordes redondeados y sombras.

## Arranque rápido
- Backend (terminal 1): `venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000`
- Frontend (terminal 2): `cd frontend && npm install && npm run dev`

## Notas
- CORS está habilitado para `localhost` por simplicidad.
- La simulación usa FSPL y genera FFT con `numpy`/`scipy`.
