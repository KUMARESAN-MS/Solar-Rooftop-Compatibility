"""
Application configuration.
All settings are centralized here — no magic strings scattered in code.
"""

import os
from pathlib import Path

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "solar.db"
REFERENCE_DATA_PATH = BASE_DIR / "data" / "reference_data.json"
ML_MODEL_PATH = BASE_DIR / "app" / "ml" / "model.joblib"

# --- Database ---
DATABASE_URL = f"sqlite:///{DB_PATH}"

# --- JWT Auth ---
ENV = os.getenv("ENV", "development")
_default_secret = "dev-secret-change-in-production-abc123xyz"
SECRET_KEY = os.getenv("SECRET_KEY", _default_secret)

if ENV == "production" and SECRET_KEY == _default_secret:
    raise ValueError("SECRET_KEY environment variable must be set in production!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# --- External APIs ---
PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/v5_3"
NASA_POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"

# --- Solar Constants (defaults, overridable per calculation) ---
PANEL_EFFICIENCY = 0.20           # 20% for modern panels
PERFORMANCE_RATIO = 0.78          # Accounts for inverter, wiring, soiling losses
TEMP_COEFFICIENT = -0.004         # -0.4% per °C above STC reference
STC_REFERENCE_TEMP = 25.0         # °C (Standard Test Conditions)
ANNUAL_DEGRADATION_RATE = 0.005   # 0.5% per year
PANEL_AREA_PER_KW = 5.0           # ~5 sqm per kW for modern panels (~200W/sqm)
SYSTEM_LIFETIME_YEARS = 25

# --- CORS ---
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
