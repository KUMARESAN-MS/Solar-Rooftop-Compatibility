from fastapi import APIRouter, HTTPException
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, FinancialAnalysis, EnvironmentalAnalysis
from app.services.irradiance import get_solar_data
from app.services.physics import calculate_generation
from app.services.sizing import calculate_system_size
from app.services.financials import calculate_financials, get_average_tariff
from app.services.environmental import calculate_co2_savings, calculate_equivalent_trees_planted

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_property(request: AnalyzeRequest):
    """
    Perform a comprehensive solar rooftop analysis.
    Uses physics-based calculation and ML prediction (when available).
    """
    try:
        # 1. Fetch Irradiance
        solar_data = await get_solar_data(request.latitude, request.longitude)
        
        # 2. System Sizing
        tariff_rate = get_average_tariff()
        system_size_kw = calculate_system_size(request.roof_area_sqm, request.monthly_bill, tariff_rate)
        
        if system_size_kw <= 0:
            raise HTTPException(status_code=400, detail="Roof area too small or no solar potential.")
        
        # 3. Physics-based Generation
        annual_generation = round(calculate_generation(solar_data.annual_ghi, system_size_kw), 2)
        
        # 6. Financials
        fin_data = calculate_financials(system_size_kw, annual_generation, request.monthly_bill)
        
        # 7. Environmental
        co2_saved = calculate_co2_savings(annual_generation)
        trees = calculate_equivalent_trees_planted(co2_saved)
        
        return AnalyzeResponse(
            latitude=request.latitude,
            longitude=request.longitude,
            recommended_system_size_kw=system_size_kw,
            annual_generation_kwh=annual_generation,
            financials=FinancialAnalysis(**fin_data),
            environmental=EnvironmentalAnalysis(
                co2_saved_tonnes=co2_saved,
                equivalent_trees_planted=trees
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

