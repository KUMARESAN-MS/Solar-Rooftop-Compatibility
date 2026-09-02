from pydantic import BaseModel, Field
from typing import Optional

class AnalyzeRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)
    roof_area_sqm: float = Field(..., description="Usable roof area in square meters", gt=0)
    monthly_bill: float = Field(..., description="Average monthly electricity bill", ge=0)

class FinancialAnalysis(BaseModel):
    gross_cost: float
    subsidy: float
    net_cost: float
    annual_savings: float
    payback_period_years: float

class EnvironmentalAnalysis(BaseModel):
    co2_saved_tonnes: float
    equivalent_trees_planted: int

class AnalyzeResponse(BaseModel):
    latitude: float
    longitude: float
    recommended_system_size_kw: float
    annual_generation_kwh: float
    ml_predicted_generation_kwh: Optional[float] = Field(None, description="ML model prediction (if available)")
    prediction_source: str = Field("physics", description="'physics', 'ml', or 'hybrid'")
    financials: FinancialAnalysis
    environmental: EnvironmentalAnalysis
