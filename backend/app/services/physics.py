from app.config import PANEL_EFFICIENCY, PERFORMANCE_RATIO

def calculate_generation(annual_ghi: float, system_size_kw: float,
                         performance_ratio: float = PERFORMANCE_RATIO) -> float:
    """
    Calculate annual solar PV generation (kWh).
    Annual Generation (kWh) = system_size_kw * annual_ghi (kWh/m2) * performance_ratio
    (Assuming STC irradiance is 1000 W/m2)
    """
    return system_size_kw * annual_ghi * performance_ratio

def calculate_monthly_generation(monthly_ghi: list[float], system_size_kw: float,
                                 performance_ratio: float = PERFORMANCE_RATIO) -> list[float]:
    """Calculate monthly PV generation (kWh)."""
    return [ghi * system_size_kw * performance_ratio for ghi in monthly_ghi]
