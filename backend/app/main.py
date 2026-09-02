"""
FastAPI application entry point.
Configures CORS, includes routers, and creates database tables on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import create_tables

# --- App Initialization ---
app = FastAPI(
    title="Solar Rooftop Prediction API",
    description="AI-powered solar rooftop potential prediction and energy optimization",
    version="0.1.0",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Startup Event ---
@app.on_event("startup")
def on_startup():
    """Create database tables on first run."""
    create_tables()


# --- Health Check ---
@app.get("/health", tags=["System"])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    return {"status": "ok", "service": "solar-rooftop-api", "version": "0.1.0"}


# --- API Info ---
@app.get("/", tags=["System"])
def root():
    """Root endpoint with API information."""
    return {
        "message": "Solar Rooftop Prediction API",
        "docs": "/docs",
        "health": "/health",
    }


# ------------------------------------------------------------------
from app.routers import solar, analyze
app.include_router(solar.router, prefix="/api/v1", tags=["Solar Data"])
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
# Routers will be included here as we build each module:
from app.routers import auth, properties, analyses
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(properties.router, prefix="/api/v1", tags=["Properties"])
app.include_router(analyses.router, prefix="/api/v1", tags=["Analyses"])
# ------------------------------------------------------------------
