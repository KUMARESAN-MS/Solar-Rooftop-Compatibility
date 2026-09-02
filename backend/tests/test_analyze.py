import pytest
from unittest.mock import patch

@patch("app.routers.analyze.get_solar_data")
def test_analyze_property(mock_get_solar, client):
    # Mock the return value of get_solar_data
    class MockSolarData:
        def __init__(self):
            self.annual_ghi = 2000.0 # 2000 kWh/m2/yr
            self.avg_temperature = 25.0
            
    mock_get_solar.return_value = MockSolarData()
    
    response = client.post("/api/v1/analyze", json={
        "latitude": 17.38,
        "longitude": 78.48,
        "roof_area_sqm": 50.0,
        "monthly_bill": 2000.0
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "recommended_system_size_kw" in data
    assert "annual_generation_kwh" in data
    
    # Financials shape contract
    assert "financials" in data
    assert "net_cost" in data["financials"]
    assert "subsidy" in data["financials"]
    assert "payback_period_years" in data["financials"]
    assert "annual_savings" in data["financials"]
    
    # Environmental shape contract
    assert "environmental" in data
    assert "co2_saved_tonnes" in data["environmental"]
    assert "equivalent_trees_planted" in data["environmental"]
    
    # Roof fits: 50 / 5 = 10 kW
    # Needed: 2000 / 5.50 = 363.6 kWh/mo -> 363.6 / 120 = ~3.03 kW
    # Recommended should be ~3.03 kW
    assert data["recommended_system_size_kw"] > 0
