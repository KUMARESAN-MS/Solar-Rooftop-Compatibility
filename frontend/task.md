# Task List

## Phase 0 — Project Scaffolding & Environment Setup

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

## Phase 1 — Reference Data + Irradiance Fetching
- [/] Reference data JSON template
- [/] PVGIS API integration
- [ ] NASA POWER fallback
- [ ] `/api/v1/solar-data` endpoint
- [ ] Tests

## Phase 2 — Physics Engine + Sizing + Financials
- [ ] Physics-based PV generation engine
- [ ] System sizing logic
- [ ] Financial module
- [ ] Environmental module
- [ ] `/api/v1/analyze` endpoint
- [ ] Validation against PVGIS

## Phase 3 — ML Pipeline
- [ ] Synthetic dataset generation notebook
- [ ] Feature engineering + model training notebook
- [ ] Model export + inference wrapper
- [ ] ML integration into analyze endpoint

## Phase 4 — Database + Authentication
- [ ] Database schema (users, properties, analyses)
- [ ] Auth endpoints (register, login)
- [ ] JWT middleware
- [ ] Property CRUD endpoints

## Phase 5 — Frontend: Input Flow
- [ ] Landing page
- [ ] Location picker (Leaflet map)
- [ ] Multi-step wizard
- [ ] Processing/loading screen
- [ ] API integration

## Phase 6 — Frontend: Results Dashboard
- [ ] Summary hero card
- [ ] Generation tab (charts)
- [ ] Financials tab (charts)
- [ ] Comparison tab (table)
- [ ] Environmental tab
- [ ] Assumptions panel
- [ ] Saved properties grid

## Phase 7 — Polish, Edge Cases, Testing
- [ ] Edge case handling
- [ ] UI polish
- [ ] Testing
- [ ] Report support
