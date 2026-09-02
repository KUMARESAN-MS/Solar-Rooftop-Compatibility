from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Property
from app.schemas.properties import PropertyCreate, PropertyUpdate, PropertyResponse
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/properties", response_model=List[PropertyResponse])
def get_properties(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
    return properties

@router.post("/properties", response_model=PropertyResponse)
def create_property(prop_data: PropertyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_property = Property(
        owner_id=current_user.id,
        name=prop_data.name,
        latitude=prop_data.latitude,
        longitude=prop_data.longitude,
        roof_area_sqm=prop_data.roof_area_sqm,
        monthly_bill=prop_data.monthly_bill
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

@router.put("/properties/{property_id}", response_model=PropertyResponse)
def update_property(property_id: int, prop_data: PropertyUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == current_user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    update_data = prop_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)
        
    db.commit()
    db.refresh(prop)
    return prop

@router.delete("/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(property_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == current_user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(prop)
    db.commit()
    return None
