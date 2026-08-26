from pydantic import BaseModel

class MaterialIn(BaseModel):
    yarn_type: str
    name: str
    color_hex: str = "#FFFFFF"
    price_per_100g: float = 0
    stock_g: float = 0

class MaterialOut(MaterialIn):
    id: int
    class Config:
        from_attributes = True
