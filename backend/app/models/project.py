from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    width_cm = Column(Float, default=80)
    height_cm = Column(Float, default=60)
    status = Column(String(50), default="In Progress")
    original_path = Column(String(500), nullable=True)
    preview_path = Column(String(500), nullable=True)
    notes = Column(Text, default="")
    material_cost = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
