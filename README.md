# SolarPredict — AI-Based Solar Rooftop Prediction System

An AI-powered web application that helps homeowners determine whether solar is worthwhile for their specific property. Users enter their location and basic property details, and the system provides a complete solar analysis including system sizing, generation estimates, financial projections, and environmental impact.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | SQLite + SQLAlchemy |
| ML | scikit-learn |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |

## Getting Started

### Backend

```bash
cd backend
.\venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000. API docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173. API calls are proxied to :8000.

## Project Structure

```
EVS/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings & constants
│   │   ├── database.py      # SQLite setup
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API routes
│   │   ├── services/        # Business logic
│   │   └── ml/              # ML model & inference
│   ├── data/                # Reference data
│   ├── notebooks/           # ML training notebooks
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Screen components
│   │   ├── components/      # Reusable UI
│   │   ├── services/        # API client
│   │   └── ...
│   └── package.json
└── README.md
```
