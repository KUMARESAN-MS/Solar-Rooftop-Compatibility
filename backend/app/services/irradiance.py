"""
Service for fetching solar irradiance and temperature data from external APIs.
Primary: PVGIS
Fallback: NASA POWER
"""

import httpx
import logging
from app.config import PVGIS_BASE_URL, NASA_POWER_BASE_URL
from app.schemas.solar import SolarDataResponse, MonthlySolarData

logger = logging.getLogger(__name__)

async def fetch_pvgis_data(lat: float, lon: float) -> dict | None:
    """
    Fetch monthly solar radiation data from PVGIS.
    We request the MRV (Monthly Radiation Values) for a typical meteorological year.
    """
    url = f"{PVGIS_BASE_URL}/MRcalc"
    params = {
        "lat": lat,
        "lon": lon,
        "horirrad": 1, # Horizontal irradiation
        "mrad": 1,     # Monthly radiation
        "outputformat": "json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data
    except Exception as e:
        logger.error(f"Error fetching from PVGIS: {e}")
        return None

async def fetch_nasa_power_data(lat: float, lon: float) -> dict | None:
    """
    Fallback to NASA POWER API if PVGIS fails.
    """
    url = NASA_POWER_BASE_URL
    params = {
        "parameters": "ALLSKY_SFC_SW_DWN,T2M",
        "community": "RE",
        "longitude": lon,
        "latitude": lat,
        "format": "JSON",
        "start": "2020", # get recent climatology
        "end": "2020"
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data
    except Exception as e:
        logger.error(f"Error fetching from NASA POWER: {e}")
        return None

def process_pvgis_data(lat: float, lon: float, raw_data: dict) -> SolarDataResponse:
    """Extract required fields from PVGIS JSON response."""
    # PVGIS returns monthly data in 'outputs' -> 'monthly'
    # H(h_m): Irradiation on horizontal plane (kWh/m2/mo)
    # T2m: 2m temperature (°C)
    
    monthly_list = raw_data.get("outputs", {}).get("monthly", [])
    
    monthly_data = []
    annual_ghi = 0.0
    total_temp = 0.0
    
    # Typically 12 months are returned
    for m in monthly_list:
        month_num = m.get("month")
        ghi = m.get("H(h_m)", 0.0)
        temp = m.get("T2m", 25.0)
        
        monthly_data.append(MonthlySolarData(
            month=month_num,
            ghi=ghi,
            dni=0.0, # PVGIS MRcalc might not return DNI unless requested, we rely on GHI
            temperature=temp
        ))
        
        annual_ghi += ghi
        total_temp += temp
        
    avg_temp = total_temp / max(1, len(monthly_data))
    
    return SolarDataResponse(
        latitude=lat,
        longitude=lon,
        annual_ghi=annual_ghi,
        avg_temperature=avg_temp,
        monthly_data=monthly_data,
        source="PVGIS"
    )

def process_nasa_power_data(lat: float, lon: float, raw_data: dict) -> SolarDataResponse:
    """Extract required fields from NASA POWER JSON response."""
    parameters = raw_data.get("properties", {}).get("parameter", {})
    ghi_data = parameters.get("ALLSKY_SFC_SW_DWN", {})
    temp_data = parameters.get("T2M", {})
    
    days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    monthly_data = []
    annual_ghi = 0.0
    total_temp = 0.0
    valid_months = 0
    
    for month_idx in range(1, 13):
        # NASA keys are like "202001" for Jan 2020
        key = f"2020{month_idx:02d}"
        
        # NASA provides daily average for the month (kWh/m2/day)
        daily_ghi = ghi_data.get(key, 0.0)
        if daily_ghi < 0: daily_ghi = 0.0 # handle -999
            
        temp = temp_data.get(key, 25.0)
        if temp < -100: temp = 25.0 # handle -999
        
        # Monthly GHI is daily average * days in month
        month_ghi = daily_ghi * days_in_month[month_idx - 1]
        
        monthly_data.append(MonthlySolarData(
            month=month_idx,
            ghi=month_ghi,
            dni=0.0,
            temperature=temp
        ))
        
        annual_ghi += month_ghi
        total_temp += temp
        valid_months += 1
        
    avg_temp = total_temp / max(1, valid_months)
    
    return SolarDataResponse(
        latitude=lat,
        longitude=lon,
        annual_ghi=annual_ghi,
        avg_temperature=avg_temp,
        monthly_data=monthly_data,
        source="NASA_POWER"
    )

async def get_solar_data(lat: float, lon: float) -> SolarDataResponse:
    """
    Main function to get solar data for a location.
    Tries PVGIS first, then NASA POWER.
    """
    pvgis_raw = await fetch_pvgis_data(lat, lon)
    if pvgis_raw:
        try:
            return process_pvgis_data(lat, lon, pvgis_raw)
        except Exception as e:
            logger.error(f"Error processing PVGIS data: {e}")
            
    # Fallback to NASA POWER
    logger.info("Falling back to NASA POWER")
    nasa_raw = await fetch_nasa_power_data(lat, lon)
    if nasa_raw:
        try:
            return process_nasa_power_data(lat, lon, nasa_raw)
        except Exception as e:
            logger.error(f"Error processing NASA POWER data: {e}")
            
    raise Exception("Failed to fetch solar data from available sources")
