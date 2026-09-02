import json
from app.config import REFERENCE_DATA_PATH

def load_reference_data() -> dict:
    with open(REFERENCE_DATA_PATH, 'r') as f:
        return json.load(f)

def get_average_tariff() -> float:
    """Simple average tariff for quick sizing."""
    # Placeholder: return a mid slab rate (e.g., 5.50 INR)
    return 5.50

def calculate_system_cost(system_size_kw: float, ref_data: dict) -> float:
    cost_data = ref_data["solar_install_cost"]["cost_per_kw"]
    
    if system_size_kw <= 3:
        rate = cost_data["1_to_3_kw"]
    elif system_size_kw <= 10:
        rate = cost_data["3_to_10_kw"]
    else:
        rate = cost_data["above_10_kw"]
        
    return system_size_kw * rate

def calculate_subsidy(system_size_kw: float, ref_data: dict) -> float:
    subsidy_data = ref_data["subsidy"]["subsidy_per_kw"]
    max_subsidy = ref_data["subsidy"]["max_subsidy"]
    
    total_subsidy = 0.0
    remaining_kw = system_size_kw
    
    for tier in subsidy_data:
        tier_size = tier["to_kw"] - tier["from_kw"]
        applicable_kw = min(remaining_kw, tier_size)
        if applicable_kw > 0:
            total_subsidy += applicable_kw * tier["subsidy_per_kw"]
            remaining_kw -= applicable_kw
            
    return min(total_subsidy, max_subsidy)

def calculate_financials(system_size_kw: float, annual_generation_kwh: float, monthly_bill: float) -> dict:
    ref_data = load_reference_data()
    
    gross_cost = calculate_system_cost(system_size_kw, ref_data)
    subsidy = calculate_subsidy(system_size_kw, ref_data)
    net_cost = gross_cost - subsidy
    
    tariff_rate = get_average_tariff()
    annual_bill = monthly_bill * 12
    
    value_of_generation = annual_generation_kwh * tariff_rate
    
    annual_savings = min(annual_bill, value_of_generation)
    
    # Add feed-in tariff for excess generation
    excess_generation = annual_generation_kwh - (annual_bill / tariff_rate)
    if excess_generation > 0:
        feed_in_rate = ref_data["net_metering"]["feed_in_tariff_per_kwh"]
        annual_savings += excess_generation * feed_in_rate
        
    payback_period = net_cost / annual_savings if annual_savings > 0 else 0
    
    return {
        "gross_cost": round(gross_cost, 2),
        "subsidy": round(subsidy, 2),
        "net_cost": round(net_cost, 2),
        "annual_savings": round(annual_savings, 2),
        "payback_period_years": round(payback_period, 2)
    }
