from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.deps import current_user

router = APIRouter(prefix="/calculator", tags=["calculator"])

class CalcIn(BaseModel):
    width_cm: float
    height_cm: float
    density_g_per_cm2: float = 0.135
    price_per_100g: float
    waste_percent: float = 10

@router.post("")
def calculate(data: CalcIn, _=Depends(current_user)):
    area_m2 = data.width_cm * data.height_cm / 10000
    base_g = data.width_cm * data.height_cm * data.density_g_per_cm2
    total_g = base_g * (1 + data.waste_percent / 100)
    cost = total_g / 100 * data.price_per_100g
    return {
        "area_m2": round(area_m2, 4),
        "base_g": round(base_g, 1),
        "total_g": round(total_g, 1),
        "cost": round(cost, 2),
    }
