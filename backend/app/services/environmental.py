from app.services.financials import load_reference_data

def calculate_co2_savings(annual_generation_kwh: float) -> float:
    ref_data = load_reference_data()
    tco2_per_mwh = ref_data["grid_emission_factor"]["value_tco2_per_mwh"]
    
    annual_generation_mwh = annual_generation_kwh / 1000.0
    co2_saved_tonnes = annual_generation_mwh * tco2_per_mwh
    
    return round(co2_saved_tonnes, 2)
    
def calculate_equivalent_trees_planted(co2_saved_tonnes: float) -> int:
    # A typical mature tree absorbs ~21 kg of CO2 per year
    kg_co2_saved = co2_saved_tonnes * 1000
    trees = kg_co2_saved / 21.0
    return int(trees)
