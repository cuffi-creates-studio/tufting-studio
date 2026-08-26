from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import Base, engine, SessionLocal
from app.core.config import UPLOAD_DIR, EXPORT_DIR
from app.models.user import User
from app.models.project import Project
from app.models.material import Material
from app.core.security import hash_password
from app.api import auth, projects, materials, image_tools, calculator

app = FastAPI(title="Tufting Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(
                username="admin",
                display_name="Studio Owner",
                password_hash=hash_password("admin123")
            ))
        if db.query(Material).count() == 0:
            db.add_all([
                Material(yarn_type="Acrylic", name="Acrylic Standard", color_hex="#FF7A20", price_per_100g=3.50, stock_g=1200),
                Material(yarn_type="Wool", name="Wool Premium", color_hex="#744BE3", price_per_100g=5.80, stock_g=800),
            ])
        db.commit()
    finally:
        db.close()

seed()

app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(image_tools.router, prefix="/api")
app.include_router(calculator.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")

@app.get("/api/health")
def health():
    return {"ok": True, "app": "Tufting Studio"}
