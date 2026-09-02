from fastapi import APIRouter, HTTPException
from app.schemas.solar import SolarDataRequest, SolarDataResponse
from app.services.irradiance import get_solar_data

router = APIRouter()

@router.post("/solar-data", response_model=SolarDataResponse)
async def fetch_solar_data(request: SolarDataRequest):
    """
    Fetch historical solar irradiance and temperature data for a given location.
    """
    try:
        data = await get_solar_data(request.latitude, request.longitude)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
