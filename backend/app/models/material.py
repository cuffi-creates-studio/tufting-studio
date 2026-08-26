from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True)
    yarn_type = Column(String(50), nullable=False)
    name = Column(String(120), nullable=False)
    color_hex = Column(String(20), default="#FFFFFF")
    price_per_100g = Column(Float, default=0)
    stock_g = Column(Float, default=0)
