"""
Synthetic Dataset Generator for Solar Rooftop ML Model.

Generates realistic training data by combining physics-based calculations
with controlled noise, simulating diverse Indian locations and roof types.

Features:
  - latitude, longitude
  - roof_area_sqm
  - annual_ghi (kWh/m2/yr) — from irradiance data
  - avg_temperature (°C)
  - system_size_kw — from sizing logic
  - tilt_angle (degrees) — panel tilt

Target:
  - annual_generation_kwh — physics-based + noise
"""

import numpy as np
import pandas as pd
import os

# --- Constants (mirrored from app/config.py) ---
PERFORMANCE_RATIO = 0.78
TEMP_COEFFICIENT = -0.004
STC_REFERENCE_TEMP = 25.0
PANEL_AREA_PER_KW = 5.0
ANNUAL_DEGRADATION_RATE = 0.005

np.random.seed(42)


def generate_dataset(n_samples: int = 5000) -> pd.DataFrame:
    """Generate synthetic solar rooftop dataset."""

    # --- 1. Sample locations across India ---
    # Latitude range: 8°N (Kanyakumari) to 35°N (Kashmir)
    latitudes = np.random.uniform(8.0, 35.0, n_samples)
    # Longitude range: 68°E (Gujarat) to 97°E (Arunachal)
    longitudes = np.random.uniform(68.0, 97.0, n_samples)

    # --- 2. Annual GHI (kWh/m2/yr) ---
    # India average: 1600–2200 kWh/m2/yr. Higher in Rajasthan, lower in NE.
    # Model as function of latitude (lower lat = higher GHI generally) + noise
    base_ghi = 2200 - (latitudes - 8) * 18  # decreases ~18 per degree north
    ghi_noise = np.random.normal(0, 80, n_samples)
    annual_ghi = np.clip(base_ghi + ghi_noise, 1200, 2400)

    # --- 3. Average Temperature (°C) ---
    # Roughly 20–35°C, inversely correlated with latitude in India
    base_temp = 35 - (latitudes - 8) * 0.45
    temp_noise = np.random.normal(0, 2, n_samples)
    avg_temperature = np.clip(base_temp + temp_noise, 15, 42)

    # --- 4. Roof Area (sqm) ---
    # Small residential: 20–50, Medium: 50–150, Large/commercial: 150–500
    roof_category = np.random.choice(["small", "medium", "large"], n_samples, p=[0.5, 0.35, 0.15])
    roof_area = np.zeros(n_samples)
    for i, cat in enumerate(roof_category):
        if cat == "small":
            roof_area[i] = np.random.uniform(20, 50)
        elif cat == "medium":
            roof_area[i] = np.random.uniform(50, 150)
        else:
            roof_area[i] = np.random.uniform(150, 500)

    # --- 5. System Size (kW) ---
    # Limited by roof area; ~5 sqm per kW
    max_kw_roof = roof_area / PANEL_AREA_PER_KW
    # Also limited by typical residential systems (1–10 kW)
    system_size_kw = np.clip(max_kw_roof * np.random.uniform(0.6, 1.0, n_samples), 1, 100)
    system_size_kw = np.round(system_size_kw, 2)

    # --- 6. Tilt Angle (degrees) ---
    # Optimal tilt ≈ latitude for India. Add some variation.
    tilt_angle = latitudes + np.random.uniform(-10, 10, n_samples)
    tilt_angle = np.clip(tilt_angle, 5, 45)

    # --- 7. Target: Annual Generation (kWh) — physics-based ---
    # Generation = system_size * GHI * PR * temp_correction * tilt_correction
    temp_correction = 1 + TEMP_COEFFICIENT * (avg_temperature - STC_REFERENCE_TEMP)
    # Simple tilt factor: optimal when tilt ≈ latitude
    tilt_deviation = np.abs(tilt_angle - latitudes)
    tilt_factor = 1 - 0.003 * tilt_deviation  # ~0.3% loss per degree off optimal

    annual_generation = (
        system_size_kw
        * annual_ghi
        * PERFORMANCE_RATIO
        * temp_correction
        * tilt_factor
    )

    # Add realistic noise (±5%) to simulate real-world variability
    noise_factor = np.random.normal(1.0, 0.05, n_samples)
    annual_generation *= noise_factor
    annual_generation = np.round(np.clip(annual_generation, 0, None), 2)

    # --- Build DataFrame ---
    df = pd.DataFrame({
        "latitude": np.round(latitudes, 4),
        "longitude": np.round(longitudes, 4),
        "roof_area_sqm": np.round(roof_area, 1),
        "annual_ghi": np.round(annual_ghi, 2),
        "avg_temperature": np.round(avg_temperature, 2),
        "system_size_kw": system_size_kw,
        "tilt_angle": np.round(tilt_angle, 1),
        "annual_generation_kwh": annual_generation,
    })

    return df


if __name__ == "__main__":
    print("Generating synthetic solar dataset...")
    df = generate_dataset(n_samples=5000)

    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "synthetic_solar_data.csv")

    df.to_csv(output_path, index=False)
    print(f"Dataset saved to {output_path}")
    print(f"Shape: {df.shape}")
    print(f"\nSample rows:\n{df.head()}")
    print(f"\nStatistics:\n{df.describe()}")
