from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import current_user
from app.models.material import Material
from app.schemas.material import MaterialIn, MaterialOut

router = APIRouter(prefix="/materials", tags=["materials"])

@router.get("", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db), _=Depends(current_user)):
    return db.query(Material).order_by(Material.name).all()

@router.post("", response_model=MaterialOut)
def add_material(data: MaterialIn, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = Material(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put("/{material_id}", response_model=MaterialOut)
def update_material(material_id: int, data: MaterialIn, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = db.get(Material, material_id)
    if not obj:
        raise HTTPException(404, "Material not found")
    for k,v in data.model_dump().items():
        setattr(obj,k,v)
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = db.get(Material, material_id)
    if not obj:
        raise HTTPException(404, "Material not found")
    db.delete(obj); db.commit()
    return {"ok": True}
