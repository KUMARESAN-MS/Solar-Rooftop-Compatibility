import pytest
from unittest.mock import patch, AsyncMock


@patch("app.routers.analyze.get_solar_data")
@patch("app.routers.analyze._resolve_country_code", new_callable=AsyncMock)
def test_analyze_property(mock_country, mock_get_solar, client):
    """
    CONTRACT TEST: validates the exact shape of AnalyzeResponse that the frontend relies on.
    Any change here that breaks this test signals a frontend contract violation.
    """
    mock_country.return_value = "IN"

    class MockMonthly:
        def __init__(self, ghi):
            self.ghi = ghi

    class MockSolarData:
        annual_ghi = 2000.0
        avg_temperature = 25.0
        monthly_data = [MockMonthly(2000.0 / 12) for _ in range(12)]

    mock_get_solar.return_value = MockSolarData()

    response = client.post("/api/v1/analyze", json={
        "latitude": 17.38,
        "longitude": 78.48,
        "roof_area_sqm": 50.0,
        "monthly_bill": 2000.0,
    })

    assert response.status_code == 200, response.text
    data = response.json()

    # Top-level shape
    assert "recommended_system_size_kw" in data
    assert "annual_generation_kwh" in data
    assert "monthly_generation_kwh" in data
    assert isinstance(data["monthly_generation_kwh"], list)
    assert len(data["monthly_generation_kwh"]) == 12

    # Financials — NEW shape: each money field is {amount, currency}
    fin = data["financials"]
    assert "financials" in data

    for money_field in ("gross_cost", "subsidy", "net_cost", "annual_savings"):
        assert money_field in fin, f"Missing financials.{money_field}"
        assert "amount" in fin[money_field], f"financials.{money_field} missing .amount"
        assert "currency" in fin[money_field], f"financials.{money_field} missing .currency"
        assert isinstance(fin[money_field]["amount"], (int, float))
        assert isinstance(fin[money_field]["currency"], str)

    assert "payback_period_years" in fin
    assert isinstance(fin["payback_period_years"], (int, float))
    assert "currency" in fin   # top-level currency code for the block
    assert "locale" in fin     # BCP-47 locale for Intl.NumberFormat

    # Environmental shape
    assert "environmental" in data
    assert "co2_saved_tonnes" in data["environmental"]
    assert "equivalent_trees_planted" in data["environmental"]

    # Sanity check on sizing logic
    assert data["recommended_system_size_kw"] > 0
