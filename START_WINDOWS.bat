@echo off
setlocal

echo ================================
echo  TUFTING STUDIO PROFESSIONAL
echo ================================

if not exist backend\.venv (
  echo [1/4] Creating Python environment...
  py -m venv backend\.venv
)

echo [2/4] Installing backend requirements...
call backend\.venv\Scripts\activate
pip install -r backend\requirements.txt

echo [3/4] Installing frontend packages...
cd frontend
call npm install
cd ..

echo [4/4] Starting backend and frontend...
start "Tufting Backend" cmd /k "call backend\.venv\Scripts\activate && cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "Tufting Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1"

echo Done.
endlocal
