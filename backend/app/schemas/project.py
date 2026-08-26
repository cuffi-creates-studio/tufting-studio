from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    name: str
    width_cm: float = 80
    height_cm: float = 60
    notes: str = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    material_cost: Optional[float] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    width_cm: float
    height_cm: float
    status: str
    original_path: str | None = None
    preview_path: str | None = None
    notes: str
    material_cost: float

    class Config:
        from_attributes = True
