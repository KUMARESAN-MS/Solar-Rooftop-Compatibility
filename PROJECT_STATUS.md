# Project Status & Task List

## Completed Tasks

### Phase 0 — Project Scaffolding & Environment Setup
- [x] Check environment (Python, Node.js, npm)
- [x] Create backend structure
  - [x] Python virtual environment
  - [x] Install dependencies (FastAPI, uvicorn, SQLAlchemy, bcrypt, PyJWT, httpx, scikit-learn, joblib)
  - [x] FastAPI app skeleton with health endpoint
  - [x] Config module
  - [x] Database setup (SQLite + SQLAlchemy)
  - [x] Folder structure (routers, services, schemas, models, ml)
- [x] Create frontend structure
  - [x] Vite + React scaffold
  - [x] Install Tailwind CSS + Framer Motion + Recharts + React Router + Leaflet
  - [x] Folder structure (components, pages, hooks, services, context, utils)
  - [x] Global styles + design tokens
  - [x] Placeholder landing page
- [x] Integration
  - [x] CORS configured on backend
  - [x] Vite proxy to backend
  - [x] Both servers start and communicate
- [x] `.gitignore` and `README.md`

### Phase 1 — Reference Data + Irradiance Fetching
- [x] Reference data JSON template
- [x] PVGIS API integration
- [x] NASA POWER fallback
- [x] `/api/v1/solar-data` endpoint
- [x] Tests (Pytest setup & mock testing)

### Phase 2 — Physics Engine + Sizing + Financials
- [x] Physics-based PV generation engine
- [x] System sizing logic
- [x] Financial module
- [x] Environmental module
- [x] `/api/v1/analyze` endpoint
- [x] Validation against PVGIS / Unit tests passed

---

## Yet to Complete Tasks

### Phase 3 — ML Pipeline
- [x] Synthetic dataset generation script (`app/ml/generate_dataset.py` — 5000 samples)
- [x] Feature engineering + model training script (`app/ml/train_model.py` — GBR, R²=0.9943, MAPE=4.42%)
- [x] Model export + inference wrapper (`app/ml/predictor.py` — lazy-loaded, graceful fallback)
- [ ] ML integration into analyze endpoint (hybrid physics+ML prediction) - CURRENTLY DISABLED IN CRITICAL PATH

### Phase 4 — Database + Authentication
- [x] Database schema (users, properties, analyses)
- [x] Auth endpoints (register, login)
- [x] JWT middleware
- [x] Property CRUD endpoints

### Phase 5 — Frontend: Input Flow
- [x] Landing page
- [x] Location picker (Leaflet map)
- [x] Multi-step wizard
- [x] Processing/loading screen
- [x] API integration

### Phase 6 — Frontend: Results Dashboard
- [x] Summary hero card
- [x] Generation tab (charts)
- [x] Financials tab (charts)
- [ ] Comparison tab (table)
- [x] Environmental tab
- [ ] Assumptions panel
- [ ] Saved properties grid (needs wiring to analysis)

### Phase 7 — Polish, Edge Cases, Testing
- [ ] Edge case handling
- [ ] UI polish
- [ ] Testing
- [ ] Report support
