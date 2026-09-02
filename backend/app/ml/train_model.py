"""
ML Model Training for Solar Generation Prediction.

Trains a Gradient Boosting Regressor on synthetic solar data.
Performs feature engineering, train/test split, evaluation, and exports model.

Features used:
  - latitude, longitude, roof_area_sqm, annual_ghi,
    avg_temperature, system_size_kw, tilt_angle

Target:
  - annual_generation_kwh
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler


def load_data() -> pd.DataFrame:
    """Load the synthetic dataset."""
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_solar_data.csv")
    df = pd.read_csv(data_path)
    return df


def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features."""
    # Interaction: system size * GHI is the dominant driver
    df["size_x_ghi"] = df["system_size_kw"] * df["annual_ghi"]

    # Temperature deviation from STC (25°C)
    df["temp_deviation"] = df["avg_temperature"] - 25.0

    # Tilt deviation from latitude (optimal tilt ≈ latitude)
    df["tilt_deviation"] = abs(df["tilt_angle"] - df["latitude"])

    # Roof utilization ratio (what fraction of roof is used)
    df["roof_utilization"] = (df["system_size_kw"] * 5.0) / df["roof_area_sqm"]
    df["roof_utilization"] = df["roof_utilization"].clip(0, 1)

    return df


def train_model():
    """Train, evaluate, and export the ML model."""
    print("=" * 60)
    print("  Solar Generation ML Model Training")
    print("=" * 60)

    # --- 1. Load & Engineer Features ---
    print("\n[1/5] Loading data...")
    df = load_data()
    print(f"      Loaded {len(df)} samples")

    print("[2/5] Feature engineering...")
    df = feature_engineering(df)

    feature_cols = [
        "latitude", "longitude", "roof_area_sqm", "annual_ghi",
        "avg_temperature", "system_size_kw", "tilt_angle",
        "size_x_ghi", "temp_deviation", "tilt_deviation", "roof_utilization"
    ]
    target_col = "annual_generation_kwh"

    X = df[feature_cols]
    y = df[target_col]

    # --- 2. Train/Test Split ---
    print("[3/5] Splitting data (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"      Train: {len(X_train)}, Test: {len(X_test)}")

    # --- 3. Scale features ---
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- 4. Train Model ---
    print("[4/5] Training Gradient Boosting Regressor...")
    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train_scaled, y_train)

    # --- 5. Evaluate ---
    print("[5/5] Evaluating model...")
    y_pred_train = model.predict(X_train_scaled)
    y_pred_test = model.predict(X_test_scaled)

    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100

    print("\n" + "-" * 40)
    print("  Model Performance")
    print("-" * 40)
    print(f"  Train R²:   {train_r2:.4f}")
    print(f"  Test  R²:   {test_r2:.4f}")
    print(f"  Test  MAE:  {test_mae:.2f} kWh")
    print(f"  Test  RMSE: {test_rmse:.2f} kWh")
    print(f"  Test  MAPE: {test_mape:.2f}%")
    print("-" * 40)

    # Feature importance
    importances = model.feature_importances_
    feat_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    print("\n  Feature Importances:")
    for name, imp in feat_imp:
        bar = "#" * int(imp * 50)
        print(f"    {name:20s} {imp:.4f} {bar}")

    # --- 6. Export Model + Scaler ---
    ml_dir = os.path.dirname(__file__)
    model_path = os.path.join(ml_dir, "model.joblib")
    scaler_path = os.path.join(ml_dir, "scaler.joblib")
    metadata_path = os.path.join(ml_dir, "model_metadata.joblib")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump({
        "feature_cols": feature_cols,
        "target_col": target_col,
        "train_r2": train_r2,
        "test_r2": test_r2,
        "test_mae": test_mae,
        "test_rmse": test_rmse,
        "test_mape": test_mape,
    }, metadata_path)

    print(f"\n  Model saved to:    {model_path}")
    print(f"  Scaler saved to:   {scaler_path}")
    print(f"  Metadata saved to: {metadata_path}")
    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    train_model()
