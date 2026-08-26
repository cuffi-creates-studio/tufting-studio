from sqlalchemy import Column, Integer, String
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    display_name = Column(String(120), default="Studio Owner")
    password_hash = Column(String(255), nullable=False)
