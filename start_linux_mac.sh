#!/usr/bin/env bash
set -e
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
(cd frontend && npm install)
(cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &
(cd frontend && npm run dev -- --host 127.0.0.1)
