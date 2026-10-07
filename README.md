# SolarPredict — Solar Rooftop Feasibility & Analysis System

**SolarPredict** is a full-stack web application that evaluates the technical and financial viability of installing rooftop solar panels. By combining location-specific satellite solar irradiance data with standard photovoltaic physics modeling, the application delivers unbiased estimates for system sizing, solar generation, net upfront costs, government subsidies, 25-year financial cash flows, and ecological impact.

---

## Key Features

- **Interactive Location Selection & Geocoding**: Drop a pin on the interactive map, use GPS location, or search addresses with OpenStreetMap Nominatim reverse geocoding.
- **Dynamic Currency & Locale**: Automatically detects the country from coordinates and formats all currency values dynamically (e.g. INR `₹` for India, USD `$` for the US, GBP `£` for the UK, EUR `€` for Europe).
- **Satellite Solar Irradiance**: Queries 16-year historical satellite climatology from the European Commission **PVGIS API** (`MRcalc` endpoint) with automatic fallback to the **NASA POWER API**.
- **Optimal Rooftop Sizing**: Balances usable rooftop footprint (accounting for usable fractions and modern 400W panel dimensions) against household electricity demand.
- **Physics-Based Generation Engine**: Computes annual and monthly photovoltaic yield using standard solar physics:
  $$E = P_{\text{system}} \times \text{GHI} \times \text{PR}$$
  *(Performance Ratio $PR = 0.78$ accounting for inverter efficiency, wiring, dirt/soiling, and thermal losses)*.
- **Country-Specific Financial Modeling**: Evaluates benchmark installation rates, tiered domestic electricity tariffs, and national incentives (e.g., India's **PM Surya Ghar Muft Bijli Yojana** subsidy up to ₹78,000).
- **25-Year Lifecycle Cash Flow**: Accurately models a 25-year investment lifecycle with compounding 0.5%/year solar panel degradation, levelized cost of electricity (LCOE), and break-even payback timelines.
- **Environmental Decarbonization**: Computes annual and 25-year cumulative CO₂ emissions avoided, mature tree equivalents, passenger car miles avoided, coal combustion displaced, and power plant cooling water conserved.
- **Interactive What-If Simulator**: Allows users to interactively adjust system capacity on the fly and immediately re-evaluate savings and payback periods.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Leaflet |
| **Backend** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2 |
| **Database** | SQLite (with SQLAlchemy ORM) |
| **Climate & Solar Data** | European Commission PVGIS API, NASA POWER API |
| **Maps & Geocoding** | Leaflet, OpenStreetMap, Nominatim API |

---

## Getting Started

### Prerequisites
- **Python 3.9+** (Python 3.11 recommended)
- **Node.js 18+** & **npm**

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell / CMD):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Alternative if running directly via the virtual environment:*
   ```powershell
   .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
   ```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### 2. Frontend Setup (React / Vite)

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

- **Frontend Application**: `http://localhost:5173`
- API calls to `/api/v1` and `/health` are automatically proxied to the backend on `:8000`.

---

## Testing & Verification

### Run Backend Unit Tests
From the `backend` directory with the virtual environment activated:
```bash
pytest
```
*Runs all 10 unit tests covering physics generation, system sizing, financial modeling, and solar irradiance retrieval.*

### Run Frontend Production Build
From the `frontend` directory:
```bash
npm run build
```

---

## Project Structure

```
EVS/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application entry point & CORS
│   │   ├── config.py        # Centralized settings and file paths
│   │   ├── database.py      # SQLite connection & session management
│   │   ├── models/          # SQLAlchemy ORM models (User, Property, Analysis)
│   │   ├── schemas/         # Pydantic v2 request/response schemas
│   │   ├── routers/         # API routes (analyze, solar_data, location, auth)
│   │   └── services/        # Business logic:
│   │       ├── physics.py       # Photovoltaic generation physics formulas
│   │       ├── sizing.py        # Rooftop area & demand-based sizing algorithm
│   │       ├── financials.py    # Country benchmark costs, subsidies & cash flows
│   │       ├── irradiance.py    # PVGIS & NASA POWER satellite API clients
│   │       ├── environmental.py # Grid emission factors & ecological KPIs
│   │       └── geocoding.py     # Reverse geocoding & country detection
│   ├── data/                # Country electricity tariffs & reference benchmarks
│   ├── tests/               # Backend test suite (pytest)
│   └── requirements.txt     # Python production dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/           # LandingPage, MapPage, WizardPage, ResultsPage, etc.
│   │   ├── components/      # LocationPicker, RoofAreaSelector, CurrencyDisplay, etc.
│   │   ├── services/        # Axios API client & backend endpoints
│   │   ├── utils/           # formatCurrency, currencyMapping, geocoding
│   │   ├── context/         # ThemeContext (dark/light mode)
│   │   ├── index.css        # Design tokens & custom styling
│   │   └── main.jsx         # React application entry point
│   ├── index.html           # HTML template & SEO metadata
│   ├── package.json         # Node.js dependencies & scripts
│   └── vite.config.js       # Vite configuration with API reverse proxy
├── .gitignore               # Git ignore configuration
└── README.md                # Project documentation
```

---

## Primary API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/analyze` | Computes full solar feasibility: system size, monthly generation, financial cash flow, and CO₂ offset. |
| `GET` | `/api/v1/solar-data` | Retrieves satellite solar irradiance (annual & monthly GHI) from PVGIS / NASA POWER. |
| `POST` | `/api/v1/location/reverse-geocode` | Resolves latitude/longitude into country, currency code, and address. |
| `GET` | `/health` | API server health check. |

Interactive OpenAPI documentation and live payload testing are accessible at [`http://localhost:8000/docs`](http://localhost:8000/docs).
