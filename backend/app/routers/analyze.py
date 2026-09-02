from fastapi import APIRouter, HTTPException
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, FinancialAnalysis, EnvironmentalAnalysis
from app.services.irradiance import get_solar_data
from app.services.physics import calculate_generation
from app.services.sizing import calculate_system_size
from app.services.financials import calculate_financials, get_average_tariff
from app.services.environmental import calculate_co2_savings, calculate_equivalent_trees_planted
from app.ml.predictor import predict_generation, is_model_available

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
        physics_generation = calculate_generation(solar_data.annual_ghi, system_size_kw)
        
        # 4. ML Prediction (optional enhancement)
        ml_generation = None
        prediction_source = "physics"
        
        if is_model_available():
            ml_generation = predict_generation(
                latitude=request.latitude,
                longitude=request.longitude,
                roof_area_sqm=request.roof_area_sqm,
                annual_ghi=solar_data.annual_ghi,
                avg_temperature=solar_data.avg_temperature,
                system_size_kw=system_size_kw,
            )
        
        # 5. Choose best estimate
        if ml_generation is not None:
            # Hybrid: average of physics and ML for robustness
            annual_generation = round((physics_generation + ml_generation) / 2, 2)
            prediction_source = "hybrid"
        else:
            annual_generation = round(physics_generation, 2)
        
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
            ml_predicted_generation_kwh=ml_generation,
            prediction_source=prediction_source,
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

