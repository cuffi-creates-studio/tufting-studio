from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
EXPORT_DIR = BASE_DIR / "exports"

for p in (DATA_DIR, UPLOAD_DIR, EXPORT_DIR):
    p.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'tufting.db'}"
SECRET_KEY = "change-this-key-before-public-release"
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24 * 7
