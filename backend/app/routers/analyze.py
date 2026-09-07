import httpx
from fastapi import APIRouter, HTTPException
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, FinancialAnalysis, MoneyValue, EnvironmentalAnalysis
from app.services.irradiance import get_solar_data
from app.services.physics import calculate_generation, calculate_monthly_generation
from app.services.sizing import calculate_system_size
from app.services.financials import calculate_financials, get_average_tariff, load_country_data
from app.services.environmental import calculate_co2_savings, calculate_equivalent_trees_planted

router = APIRouter()


async def _resolve_country_code(latitude: float, longitude: float) -> str:
    """
    Resolve a two-letter ISO country code from coordinates using Nominatim.
    Falls back to 'IN' if the call fails (safe default for current target market).
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": latitude, "lon": longitude, "format": "json"},
                headers={"User-Agent": "SolarRooftopApp/1.0"},
            )
            resp.raise_for_status()
            data = resp.json()
            code = data.get("address", {}).get("country_code", "in").upper()
            return code if code else "IN"
    except Exception:
        return "IN"


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_property(request: AnalyzeRequest):
    """
    Perform a comprehensive solar rooftop analysis.
    Uses physics-based calculation with real PVGIS irradiance data.
    Financial figures are returned in the local currency for the given coordinates.
    """
    try:
        # 1. Resolve country (non-blocking, with fallback)
        country_code = await _resolve_country_code(request.latitude, request.longitude)

        # 2. Fetch irradiance
        solar_data = await get_solar_data(request.latitude, request.longitude)

        # 3. System sizing (needs tariff for demand-side calculation)
        country_data = load_country_data(country_code)
        tariff_rate = get_average_tariff(country_data)
        system_size_kw = calculate_system_size(request.roof_area_sqm, request.monthly_bill, tariff_rate)

        if system_size_kw <= 0:
            raise HTTPException(status_code=400, detail="Roof area too small or no solar potential.")

        # 4. Physics-based generation
        annual_generation = round(calculate_generation(solar_data.annual_ghi, system_size_kw), 2)
        monthly_ghis = [m.ghi for m in solar_data.monthly_data]
        monthly_generation = [round(g, 2) for g in calculate_monthly_generation(monthly_ghis, system_size_kw)]

        # 5. Financials (country-aware, returns {amount, currency} objects)
        fin_data = calculate_financials(
            system_size_kw, annual_generation, request.monthly_bill,
            country_code, country_data=country_data
        )

        financials = FinancialAnalysis(
            gross_cost=MoneyValue(**fin_data["gross_cost"]),
            subsidy=MoneyValue(**fin_data["subsidy"]),
            net_cost=MoneyValue(**fin_data["net_cost"]),
            annual_savings=MoneyValue(**fin_data["annual_savings"]),
            payback_period_years=fin_data["payback_period_years"],
            currency=fin_data["currency"],
            locale=fin_data["locale"],
        )

        # 6. Environmental
        co2_saved = calculate_co2_savings(annual_generation, country_code)
        trees = calculate_equivalent_trees_planted(co2_saved)

        return AnalyzeResponse(
            latitude=request.latitude,
            longitude=request.longitude,
            recommended_system_size_kw=system_size_kw,
            annual_generation_kwh=annual_generation,
            monthly_generation_kwh=monthly_generation,
            financials=financials,
            environmental=EnvironmentalAnalysis(
                co2_saved_tonnes=co2_saved,
                equivalent_trees_planted=trees,
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
