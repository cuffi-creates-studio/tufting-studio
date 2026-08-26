from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_token

def authenticate(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return {
        "access_token": create_token(user.username),
        "token_type": "bearer",
        "display_name": user.display_name,
    }
