# Architecture

## Frontend
React + Vite.
UI e ndarë në faqe dhe komponentë.

## Backend
FastAPI + SQLAlchemy + SQLite.

## Image Engine
OpenCV lokal.
Pipeline:
1. Decode image
2. Edge-preserving smoothing
3. LAB color quantization
4. Region cleanup
5. Cartoon edges
6. Numbered pattern
7. Palette extraction

## Projector
Frontend-only transform layer:
- X/Y
- scale
- mirror
- opacity
- grid
- fullscreen

## Data
SQLite:
- users
- projects
- materials
