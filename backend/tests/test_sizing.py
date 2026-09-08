import pytest
from app.services.sizing import calculate_system_size

def test_calculate_system_size_fallback():
    """Verify fallback to ~120 kWh/kW/month when annual_ghi is not provided."""
    # 50 sqm roof allows 50 / 5.0 = 10 kW max
    # Bill = $120, tariff = $1.0 -> 120 kWh needed
    # Default 120 kWh/kW/mo -> 1 kW needed
    size = calculate_system_size(roof_area_sqm=50.0, monthly_bill=120.0, tariff_rate=1.0)
    assert size == 1.0

def test_calculate_system_size_with_real_irradiance():
    """Verify sizing scales with real solar irradiance."""
    # High irradiance (e.g. 2000 kWh/m2/yr, PR=0.78)
    # monthly_kwh_per_kw = 2000 * 0.78 / 12 = 130 kWh/kW/mo
    # Bill = $260, tariff = $1.0 -> 260 kWh needed -> 260 / 130 = 2.0 kW needed
    size_high = calculate_system_size(
        roof_area_sqm=100.0,
        monthly_bill=260.0,
        tariff_rate=1.0,
        annual_ghi=2000.0,
        performance_ratio=0.78
    )
    assert size_high == 2.0

    # Low irradiance (e.g. 1000 kWh/m2/yr, PR=0.78)
    # monthly_kwh_per_kw = 1000 * 0.78 / 12 = 65 kWh/kW/mo
    # 260 kWh needed -> 260 / 65 = 4.0 kW needed
    size_low = calculate_system_size(
        roof_area_sqm=100.0,
        monthly_bill=260.0,
        tariff_rate=1.0,
        annual_ghi=1000.0,
        performance_ratio=0.78
    )
    assert size_low == 4.0

def test_calculate_system_size_roof_constrained():
    """Verify size is capped by available roof area."""
    # 20 sqm roof allows max 20 / 5.0 = 4.0 kW
    # High bill requiring 10 kW
    size = calculate_system_size(
        roof_area_sqm=20.0,
        monthly_bill=2000.0,
        tariff_rate=1.0,
        annual_ghi=1800.0
    )
    assert size == 4.0
