from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginIn, TokenOut
from app.services.auth_service import authenticate

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    result = authenticate(db, data.username, data.password)
    if not result:
        raise HTTPException(401, "Wrong username or password")
    return result
