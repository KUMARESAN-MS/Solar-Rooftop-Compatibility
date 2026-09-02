from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PropertyCreate(BaseModel):
    name: str = Field("My Property", description="Property name")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    roof_area_sqm: float = Field(..., gt=0)
    monthly_bill: float = Field(..., ge=0)

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    roof_area_sqm: Optional[float] = Field(None, gt=0)
    monthly_bill: Optional[float] = Field(None, ge=0)

class PropertyResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    roof_area_sqm: float
    monthly_bill: float
    created_at: datetime

    class Config:
        from_attributes = True
