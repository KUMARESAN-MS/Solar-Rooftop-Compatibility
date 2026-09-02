from app.config import PANEL_AREA_PER_KW

def calculate_system_size(roof_area_sqm: float, monthly_bill: float, tariff_rate: float) -> float:
    """
    Determine the optimal kW system size.
    1. Maximum size that fits on the roof.
    2. Size needed to offset the monthly bill.
    Returns the minimum of the two.
    """
    # 1. Max size on roof
    max_kw_roof = roof_area_sqm / PANEL_AREA_PER_KW
    
    if tariff_rate <= 0:
        return round(max_kw_roof, 2)
        
    # 2. Size needed to offset bill
    # Target monthly kWh = monthly_bill / tariff_rate
    target_monthly_kwh = monthly_bill / tariff_rate
    
    # Approx 120 kWh generated per month per kW (conservative estimate for sizing)
    needed_kw = target_monthly_kwh / 120.0
    
    # Recommend the smaller of what's needed vs what fits
    recommended_kw = min(max_kw_roof, needed_kw)
    
    # Ensure it's at least 1 kW if they want solar, or return 0 if nothing fits
    if recommended_kw < 1.0 and max_kw_roof >= 1.0:
        recommended_kw = 1.0
        
    return round(max(0.0, recommended_kw), 2)
