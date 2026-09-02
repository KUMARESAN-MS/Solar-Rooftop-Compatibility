"""
ORM Models — Users, Properties, and Analyses.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False, default="My Property")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    roof_area_sqm = Column(Float, nullable=False)
    monthly_bill = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="properties")
    analyses = relationship("Analysis", back_populates="property", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    system_size_kw = Column(Float)
    annual_generation_kwh = Column(Float)
    ml_predicted_kwh = Column(Float, nullable=True)
    prediction_source = Column(String(50), default="physics")
    gross_cost = Column(Float)
    subsidy = Column(Float)
    net_cost = Column(Float)
    annual_savings = Column(Float)
    payback_years = Column(Float)
    co2_saved_tonnes = Column(Float)
    trees_equivalent = Column(Integer)
    raw_response = Column(Text, nullable=True)  # Store full JSON for reference
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="analyses")
