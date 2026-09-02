"""
ML Inference Wrapper for Solar Generation Prediction.

Loads the trained model and scaler, performs feature engineering,
and returns predictions. Falls back to physics-based calculation
if the model is unavailable.
"""

import os
import logging
import joblib
import numpy as np
from app.config import ML_MODEL_PATH

logger = logging.getLogger(__name__)

# --- Paths ---
ML_DIR = os.path.dirname(__file__)
SCALER_PATH = os.path.join(ML_DIR, "scaler.joblib")
METADATA_PATH = os.path.join(ML_DIR, "model_metadata.joblib")

# --- Lazy-loaded globals ---
_model = None
_scaler = None
_metadata = None
_model_available = None


def _load_model():
    """Load model, scaler, and metadata from disk (once)."""
    global _model, _scaler, _metadata, _model_available

    if _model_available is not None:
        return _model_available

    try:
        model_path = str(ML_MODEL_PATH)
        if not os.path.exists(model_path):
            logger.warning(f"ML model not found at {model_path}")
            _model_available = False
            return False

        _model = joblib.load(model_path)
        _scaler = joblib.load(SCALER_PATH)
        _metadata = joblib.load(METADATA_PATH)
        _model_available = True
        logger.info(f"ML model loaded. Test R²={_metadata.get('test_r2', 'N/A'):.4f}")
        return True
    except Exception as e:
        logger.error(f"Failed to load ML model: {e}")
        _model_available = False
        return False


def is_model_available() -> bool:
    """Check if the ML model is loaded and ready."""
    return _load_model()


def predict_generation(
    latitude: float,
    longitude: float,
    roof_area_sqm: float,
    annual_ghi: float,
    avg_temperature: float,
    system_size_kw: float,
    tilt_angle: float = None,
) -> float | None:
    """
    Predict annual solar generation using the ML model.

    Returns predicted kWh, or None if model is unavailable.
    """
    if not _load_model():
        return None

    # Default tilt to latitude (optimal for fixed-tilt panels)
    if tilt_angle is None:
        tilt_angle = latitude

    # Feature engineering (must match training pipeline)
    size_x_ghi = system_size_kw * annual_ghi
    temp_deviation = avg_temperature - 25.0
    tilt_deviation = abs(tilt_angle - latitude)
    roof_utilization = min((system_size_kw * 5.0) / roof_area_sqm, 1.0)

    features = np.array([[
        latitude, longitude, roof_area_sqm, annual_ghi,
        avg_temperature, system_size_kw, tilt_angle,
        size_x_ghi, temp_deviation, tilt_deviation, roof_utilization
    ]])

    try:
        features_scaled = _scaler.transform(features)
        prediction = _model.predict(features_scaled)[0]
        return round(max(0.0, prediction), 2)
    except Exception as e:
        logger.error(f"ML prediction failed: {e}")
        return None


def get_model_metadata() -> dict | None:
    """Return model performance metadata."""
    if _load_model() and _metadata:
        return _metadata
    return None
