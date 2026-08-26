from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import current_user
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.core.config import UPLOAD_DIR
import shutil, uuid

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), _=Depends(current_user)):
    return db.query(Project).order_by(Project.id.desc()).all()

@router.post("", response_model=ProjectOut)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = Project(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = db.get(Project, project_id)
    if not obj:
        raise HTTPException(404, "Project not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), _=Depends(current_user)):
    obj = db.get(Project, project_id)
    if not obj:
        raise HTTPException(404, "Project not found")
    db.delete(obj); db.commit()
    return {"ok": True}

@router.post("/{project_id}/image", response_model=ProjectOut)
def upload_project_image(
    project_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(current_user)
):
    obj = db.get(Project, project_id)
    if not obj:
        raise HTTPException(404, "Project not found")
    ext = Path(image.filename or ".jpg").suffix.lower() or ".jpg"
    target = UPLOAD_DIR / f"project_{project_id}_{uuid.uuid4().hex}{ext}"
    with target.open("wb") as f:
        shutil.copyfileobj(image.file, f)
    obj.original_path = target.name
    db.commit(); db.refresh(obj)
    return obj
