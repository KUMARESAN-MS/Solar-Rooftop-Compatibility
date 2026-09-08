from app.config import PANEL_AREA_PER_KW, PERFORMANCE_RATIO

def calculate_system_size(
    roof_area_sqm: float,
    monthly_bill: float,
    tariff_rate: float,
    annual_ghi: float | None = None,
    performance_ratio: float = PERFORMANCE_RATIO
) -> float:
    """
    Determine the optimal kW system size.
    1. Maximum size that fits on the roof.
    2. Size needed to offset the monthly bill, based on actual solar irradiance.
    Returns the minimum of the two.
    """
    # 1. Max size on roof
    max_kw_roof = roof_area_sqm / PANEL_AREA_PER_KW
    
    if tariff_rate <= 0:
        return round(max_kw_roof, 2)
        
    # 2. Size needed to offset bill
    # Target monthly kWh = monthly_bill / tariff_rate
    target_monthly_kwh = monthly_bill / tariff_rate
    
    # Calculate expected monthly generation per kW using actual irradiance if provided
    if annual_ghi is not None and annual_ghi > 0:
        monthly_kwh_per_kw = (annual_ghi * performance_ratio) / 12.0
    else:
        # Fallback conservative estimate: ~120 kWh per month per kW
        monthly_kwh_per_kw = 120.0
    
    needed_kw = target_monthly_kwh / monthly_kwh_per_kw if monthly_kwh_per_kw > 0 else 0.0
    
    # Recommend the smaller of what's needed vs what fits
    recommended_kw = min(max_kw_roof, needed_kw)
    
    # Ensure it's at least 1 kW if they want solar, or return 0 if nothing fits
    if recommended_kw < 1.0 and max_kw_roof >= 1.0:
        recommended_kw = 1.0
        
    return round(max(0.0, recommended_kw), 2)

