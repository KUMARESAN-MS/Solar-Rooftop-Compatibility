from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Analysis, Property
from app.schemas.analyze import AnalysisCreate, AnalysisResponseModel
from app.services.auth import get_current_user

router = APIRouter()

@router.post("/analyses", response_model=AnalysisResponseModel)
def create_analysis(analysis_data: AnalysisCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify the property belongs to the current user
    prop = db.query(Property).filter(Property.id == analysis_data.property_id, Property.owner_id == current_user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    new_analysis = Analysis(
        property_id=analysis_data.property_id,
        system_size_kw=analysis_data.system_size_kw,
        annual_generation_kwh=analysis_data.annual_generation_kwh,
        prediction_source=analysis_data.prediction_source,
        gross_cost=analysis_data.gross_cost,
        subsidy=analysis_data.subsidy,
        net_cost=analysis_data.net_cost,
        annual_savings=analysis_data.annual_savings,
        payback_years=analysis_data.payback_years,
        co2_saved_tonnes=analysis_data.co2_saved_tonnes,
        trees_equivalent=analysis_data.trees_equivalent,
        raw_response=analysis_data.raw_response
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis
