from pydantic import BaseModel, Field

class SolarDataRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)

class MonthlySolarData(BaseModel):
    month: int = Field(..., description="Month number (1-12)")
    ghi: float = Field(..., description="Global Horizontal Irradiance (kWh/m2/mo)")
    dni: float = Field(..., description="Direct Normal Irradiance (kWh/m2/mo)")
    temperature: float = Field(..., description="Average temperature (°C)")

class SolarDataResponse(BaseModel):
    latitude: float
    longitude: float
    annual_ghi: float = Field(..., description="Total annual GHI (kWh/m2/yr)")
    avg_temperature: float = Field(..., description="Average annual temperature (°C)")
    monthly_data: list[MonthlySolarData]
    source: str = Field(..., description="Source of the data (e.g., PVGIS, NASA_POWER)")
