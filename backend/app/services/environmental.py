from app.services.financials import load_country_data

# Default emission factor used when no country override is available
_DEFAULT_EMISSION_FACTOR_TCO2_PER_MWH = 0.716  # Indian southern grid (CEA)


def calculate_co2_savings(
    annual_generation_kwh: float,
    country_code: str = "IN",
) -> float:
    """
    Calculate annual CO₂ savings based on the grid emission factor for the
    given country.  Falls back to the Indian CEA value if the country data
    doesn't include an emission factor.
    """
    try:
        country_data = load_country_data(country_code)
        tco2_per_mwh = country_data["grid_emission_factor"]["value_tco2_per_mwh"]
    except (KeyError, FileNotFoundError):
        tco2_per_mwh = _DEFAULT_EMISSION_FACTOR_TCO2_PER_MWH

    annual_generation_mwh = annual_generation_kwh / 1000.0
    co2_saved_tonnes = annual_generation_mwh * tco2_per_mwh
    return round(co2_saved_tonnes, 2)


def calculate_equivalent_trees_planted(co2_saved_tonnes: float) -> int:
    """A typical mature tree sequesters ~21 kg CO₂ per year."""
    kg_co2_saved = co2_saved_tonnes * 1000
    trees = kg_co2_saved / 21.0
    return int(trees)
