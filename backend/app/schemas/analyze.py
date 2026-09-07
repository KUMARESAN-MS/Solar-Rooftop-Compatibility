from pydantic import BaseModel, Field
from typing import Optional

class AnalyzeRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)
    roof_area_sqm: float = Field(..., description="Usable roof area in square meters", gt=0)
    monthly_bill: float = Field(..., description="Average monthly electricity bill", ge=0)

# ---------------------------------------------------------------------------
# Money value: every financial amount carries its currency with it
# ---------------------------------------------------------------------------

class MoneyValue(BaseModel):
    amount: float
    currency: str  # ISO 4217 code, e.g. "INR", "USD"

class FinancialAnalysis(BaseModel):
    gross_cost: MoneyValue
    subsidy: MoneyValue
    net_cost: MoneyValue
    annual_savings: MoneyValue
    payback_period_years: float  # unitless ratio
    currency: str   # convenience: the currency code for the whole block
    locale: str     # BCP-47 locale for Intl.NumberFormat on the frontend

class EnvironmentalAnalysis(BaseModel):
    co2_saved_tonnes: float
    equivalent_trees_planted: int

class AnalyzeResponse(BaseModel):
    latitude: float
    longitude: float
    recommended_system_size_kw: float
    annual_generation_kwh: float
    monthly_generation_kwh: list[float]

    financials: FinancialAnalysis
    environmental: EnvironmentalAnalysis

# ---------------------------------------------------------------------------
# Persistence schemas (flat floats for the DB row — amounts only)
# ---------------------------------------------------------------------------

class AnalysisCreate(BaseModel):
    property_id: int
    system_size_kw: float
    annual_generation_kwh: float
    prediction_source: str = "physics"
    gross_cost: float
    subsidy: float
    net_cost: float
    annual_savings: float
    payback_years: float
    co2_saved_tonnes: float
    trees_equivalent: int
    raw_response: str = ""

class AnalysisResponseModel(BaseModel):
    id: int
    property_id: int
    system_size_kw: float
    annual_generation_kwh: float
    net_cost: float
    annual_savings: float

    class Config:
        from_attributes = True
