import pytest
from unittest.mock import patch
from app.schemas.solar import SolarDataResponse

@pytest.fixture
def mock_pvgis_response():
    return {
        "outputs": {
            "monthly": [
                {"month": i, "H(h_m)": 150.0, "T2m": 25.0} for i in range(1, 13)
            ]
        }
    }

@patch("app.services.irradiance.fetch_pvgis_data")
def test_fetch_solar_data_success(mock_fetch, client, mock_pvgis_response):
    mock_fetch.return_value = mock_pvgis_response
    
    response = client.post("/api/v1/solar-data", json={
        "latitude": 17.38,
        "longitude": 78.48
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "PVGIS"
    assert data["annual_ghi"] == 150.0 * 12
    assert data["avg_temperature"] == 25.0
    assert len(data["monthly_data"]) == 12

@patch("app.services.irradiance.fetch_pvgis_data")
@patch("app.services.irradiance.fetch_nasa_power_data")
def test_fetch_solar_data_fallback(mock_nasa_fetch, mock_pvgis_fetch, client):
    # Simulate PVGIS failure
    mock_pvgis_fetch.return_value = None
    
    # Simulate NASA POWER success
    mock_nasa_fetch.return_value = {
        "properties": {
            "parameter": {
                "ALLSKY_SFC_SW_DWN": {f"2020{i:02d}": 5.0 for i in range(1, 13)},
                "T2M": {f"2020{i:02d}": 26.0 for i in range(1, 13)}
            }
        }
    }
    
    response = client.post("/api/v1/solar-data", json={
        "latitude": 17.38,
        "longitude": 78.48
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "NASA_POWER"
    assert data["avg_temperature"] == 26.0
    # 5.0 kWh/m2/day * 366 days in 2020 (leap year)
    # wait, the logic uses [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] = 365 days
    assert data["annual_ghi"] == 5.0 * 365
