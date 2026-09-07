"""
Tests for financials service — Phase 4: dynamic tariff via country JSON.
"""
import pytest
from app.services.financials import (
    calculate_annual_electricity_bill,
    calculate_financials,
    load_country_data,
    get_average_tariff,
)


def _india_data():
    return load_country_data("IN")


def test_slab_tariff_low_bill():
    """
    A ₹100/month bill sits in slab 1 (₹1.95/kWh).
    Back-calc: 100 / 1.95 = ~51.3 kWh/mo × 12 = ~615.4 kWh/yr × avg_rate 5.50 = ~3,384.
    The function intentionally re-prices at average_rate to get a consistent tariff
    for savings calculations, so the annual value is ~3x the raw bill * 12.
    """
    country_data = _india_data()
    annual = calculate_annual_electricity_bill(100.0, country_data)
    assert annual > 0
    # 51.3 kWh/mo * 12 * 5.50 ≈ 3384
    assert 3000 < annual < 4000


def test_slab_tariff_high_bill():
    """Bill spanning multiple slabs should return a larger annual cost."""
    country_data = _india_data()
    # ₹5000/month is a high bill spanning all slabs
    annual_high = calculate_annual_electricity_bill(5000.0, country_data)
    annual_low = calculate_annual_electricity_bill(500.0, country_data)
    assert annual_high > annual_low


def test_calculate_financials_returns_money_objects():
    """calculate_financials returns {amount, currency} for all money fields."""
    country_data = _india_data()
    result = calculate_financials(
        system_size_kw=3.0,
        annual_generation_kwh=4000.0,
        monthly_bill=2000.0,
        country_code="IN",
        country_data=country_data,
    )

    for field in ("gross_cost", "subsidy", "net_cost", "annual_savings"):
        assert "amount" in result[field], f"{field} missing .amount"
        assert "currency" in result[field], f"{field} missing .currency"
        assert result[field]["currency"] == "INR"
        assert isinstance(result[field]["amount"], float)

    assert result["payback_period_years"] >= 0
    assert result["currency"] == "INR"
    assert result["locale"] == "en-IN"


def test_default_country_fallback():
    """Unknown country code falls back to DEFAULT.json (USD)."""
    result = calculate_financials(
        system_size_kw=3.0,
        annual_generation_kwh=4000.0,
        monthly_bill=150.0,
        country_code="ZZ",  # not a real country code
    )
    assert result["currency"] == "USD"
    assert result["gross_cost"]["currency"] == "USD"
