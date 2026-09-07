"""
Financial calculation service.

All monetary logic is driven by per-country JSON data loaded from
data/countries/<CC>.json (falls back to DEFAULT.json).

Key design rules:
- calculate_financials() accepts a pre-loaded country_data dict so the
  router only ever reads the JSON once per request.
- Every returned money value is wrapped as {amount, currency} so the
  frontend can format it with Intl.NumberFormat without guessing a symbol.
- Tariff is computed using slab-based billing (not a flat average) when
  the country data provides slabs.
"""

import json
from app.config import CURRENCIES_PATH, COUNTRIES_DATA_DIR

# ---------------------------------------------------------------------------
# Data loaders
# ---------------------------------------------------------------------------

def load_currencies() -> dict:
    with open(CURRENCIES_PATH, "r") as f:
        return json.load(f)

def get_currency_for_country(country_code: str) -> dict:
    """Return {code, symbol, locale} for a given ISO-3166 alpha-2 code."""
    currencies = load_currencies()
    code = (country_code or "").upper()
    return currencies.get(code, currencies["DEFAULT"])

def load_country_data(country_code: str) -> dict:
    """Load country-specific financial assumptions, falling back to DEFAULT."""
    code = (country_code or "").upper()
    country_file = COUNTRIES_DATA_DIR / f"{code}.json"
    if not country_file.exists():
        country_file = COUNTRIES_DATA_DIR / "DEFAULT.json"
    with open(country_file, "r") as f:
        return json.load(f)

# ---------------------------------------------------------------------------
# Tariff helpers
# ---------------------------------------------------------------------------

def get_average_tariff(country_data: dict) -> float:
    """Return the flat average_rate from country data (used for quick sizing)."""
    return country_data["electricity_tariff"]["average_rate"]

def calculate_annual_electricity_bill(monthly_bill: float, country_data: dict) -> float:
    """
    Estimate the true annual electricity bill using slab-based tariff.
    Monthly bill is treated as already being in local currency units — we back-
    calculate monthly consumption by walking the slab table, then annualise.

    Falls back to simple multiplication if no slabs are defined.
    """
    slabs = country_data["electricity_tariff"].get("domestic_slabs", [])
    average_rate = country_data["electricity_tariff"]["average_rate"]

    if not slabs:
        return monthly_bill * 12

    # Back-calculate monthly kWh from the monthly bill amount using slabs.
    # Walk slabs until the total cost matches the monthly bill.
    remaining_bill = monthly_bill
    monthly_kwh = 0.0
    for slab in slabs:
        slab_kwh = slab["to_kwh"] - slab["from_kwh"]
        slab_cost = slab_kwh * slab["rate"]
        if remaining_bill <= slab_cost:
            # Partial slab
            monthly_kwh += remaining_bill / slab["rate"] if slab["rate"] > 0 else 0
            remaining_bill = 0
            break
        monthly_kwh += slab_kwh
        remaining_bill -= slab_cost

    # If the bill exceeds all slabs, add the overflow at the highest rate
    if remaining_bill > 0 and slabs:
        highest_rate = slabs[-1]["rate"]
        if highest_rate > 0:
            monthly_kwh += remaining_bill / highest_rate

    return monthly_kwh * 12 * average_rate  # annualise at the average rate

# ---------------------------------------------------------------------------
# Core cost calculations
# ---------------------------------------------------------------------------

def calculate_system_cost(system_size_kw: float, country_data: dict) -> float:
    cost_data = country_data["solar_install_cost"]["cost_per_kw"]
    if system_size_kw <= 3:
        rate = cost_data["1_to_3_kw"]
    elif system_size_kw <= 10:
        rate = cost_data["3_to_10_kw"]
    else:
        rate = cost_data["above_10_kw"]
    return system_size_kw * rate

def calculate_subsidy(system_size_kw: float, country_data: dict) -> float:
    subsidy_data = country_data["subsidy"]["subsidy_per_kw"]
    max_subsidy = country_data["subsidy"]["max_subsidy"]

    total_subsidy = 0.0
    remaining_kw = system_size_kw
    for tier in subsidy_data:
        tier_size = tier["to_kw"] - tier["from_kw"]
        applicable_kw = min(remaining_kw, tier_size)
        if applicable_kw > 0:
            total_subsidy += applicable_kw * tier["subsidy_per_kw"]
            remaining_kw -= applicable_kw

    return min(total_subsidy, max_subsidy)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_financials(
    system_size_kw: float,
    annual_generation_kwh: float,
    monthly_bill: float,
    country_code: str = "IN",
    country_data: dict | None = None,  # pass pre-loaded data to avoid re-reading
) -> dict:
    """
    Calculate financials and return values as {amount, currency} objects.
    Accepts an optional pre-loaded country_data dict (from the router) to
    avoid reading the JSON file twice per request.
    """
    if country_data is None:
        country_data = load_country_data(country_code)

    currency_info = get_currency_for_country(country_code)
    currency_code_str = currency_info["code"]

    gross_cost = calculate_system_cost(system_size_kw, country_data)
    subsidy = calculate_subsidy(system_size_kw, country_data)
    net_cost = gross_cost - subsidy

    tariff_rate = get_average_tariff(country_data)
    annual_bill = calculate_annual_electricity_bill(monthly_bill, country_data)

    value_of_generation = annual_generation_kwh * tariff_rate
    annual_savings = min(annual_bill, value_of_generation)

    # Feed-in tariff for surplus generation
    annual_consumption_kwh = annual_bill / tariff_rate if tariff_rate > 0 else 0
    excess_generation = annual_generation_kwh - annual_consumption_kwh
    if excess_generation > 0:
        feed_in_rate = country_data["net_metering"]["feed_in_tariff_per_kwh"]
        annual_savings += excess_generation * feed_in_rate

    payback_period = net_cost / annual_savings if annual_savings > 0 else 0

    def money(amount: float) -> dict:
        return {"amount": round(amount, 2), "currency": currency_code_str}

    return {
        "gross_cost": money(gross_cost),
        "subsidy": money(subsidy),
        "net_cost": money(net_cost),
        "annual_savings": money(annual_savings),
        "payback_period_years": round(payback_period, 2),
        "currency": currency_code_str,
        "locale": currency_info["locale"],
    }
