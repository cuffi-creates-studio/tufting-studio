# Tufting Studio Professional

Aplikacion full-stack për punë reale me tufting.

## Çfarë përmban
- Login / session
- Dashboard responsive për PC, tablet dhe telefon
- Projects + Gallery
- Design Studio:
  - upload foto
  - sketch
  - cartoon
  - reduktim ngjyrash
  - numbered pattern
  - color palette
  - pastrim zonash të vogla
- Projector:
  - left / right / up / down
  - center
  - zoom + / -
  - mirror
  - opacity
  - grid
  - fullscreen
- Yarn & Cost Calculator
- Materials / inventory
- SQLite database
- Backend FastAPI
- OpenCV lokal, pa API me pagesë
- PWA-ready
- Electron-ready për desktop

## Kërkesat
- Python 3.11+
- Node.js 20+
- npm

## Nisja e shpejtë - Windows
1. Hap folderin.
2. Dy klikime te `START_WINDOWS.bat`
3. Backend: http://127.0.0.1:8000
4. Frontend: http://127.0.0.1:5173

## Nisja manuale

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Login demo
- username: `admin`
- password: `admin123`

Në run-in e parë backend-i krijon databazën dhe user-in demo.

## Shënim për image processing
Ky projekt përdor OpenCV lokal. Algoritmet janë të ndara në module:
- `backend/app/image_processing/sketch.py`
- `cartoon.py`
- `quantize.py`
- `numbered_pattern.py`
- `cleanup.py`

Kjo e bën të mundur që më vonë të rafinojmë vetëm motorin e fotove pa prekur UI-në, databazën apo pjesën e projektorit.


## Login final
Login-i përdor background-in e aprovuar si imazh real dhe formular real React sipër tij. Nuk ka placeholder CSS, strip poshtë, apo mockup telefoni.


## UI v3 Weather
- Dashboard weather now detects the user's location via browser geolocation with IP fallback.
- Uses Open-Meteo live weather by real latitude/longitude.
- Displays prettier weather cards, conditions, humidity and wind.
