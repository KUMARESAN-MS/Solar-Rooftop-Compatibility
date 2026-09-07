import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ReverseGeocodeRequest(BaseModel):
    latitude: float
    longitude: float

class ReverseGeocodeResponse(BaseModel):
    display_name: str
    city: str | None = None
    country: str | None = None
    country_code: str | None = None

@router.post("/location/reverse-geocode", response_model=ReverseGeocodeResponse)
async def reverse_geocode(request: ReverseGeocodeRequest):
    """
    Reverse geocode coordinates using Nominatim API.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": request.latitude,
        "lon": request.longitude,
        "format": "json",
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "SolarRooftopApp/1.0"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            address = data.get("address", {})
            
            return ReverseGeocodeResponse(
                display_name=data.get("display_name", f"{request.latitude:.4f}, {request.longitude:.4f}"),
                city=address.get("city") or address.get("town") or address.get("village"),
                country=address.get("country"),
                country_code=address.get("country_code", "").lower()
            )
    except Exception as e:
        # Fallback if Nominatim fails
        return ReverseGeocodeResponse(
            display_name=f"{request.latitude:.4f}, {request.longitude:.4f}"
        )

class SearchLocationRequest(BaseModel):
    query: str

class SearchLocationResponse(BaseModel):
    display_name: str
    latitude: float
    longitude: float

@router.post("/location/search", response_model=list[SearchLocationResponse])
async def search_location(request: SearchLocationRequest):
    """
    Search for a location by name using Nominatim API.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": request.query,
        "format": "json",
        "limit": 5
    }
    headers = {
        "User-Agent": "SolarRooftopApp/1.0"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for item in data:
                results.append(SearchLocationResponse(
                    display_name=item.get("display_name", ""),
                    latitude=float(item.get("lat")),
                    longitude=float(item.get("lon"))
                ))
            return results
    except Exception as e:
        return []
