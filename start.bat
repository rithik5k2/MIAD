@echo off
echo Starting Python backend...
start cmd /k "cd py_backend && uvicorn main:app --reload --port 8000"
@REM timeout /t 5

echo Starting Node gateway...
start cmd /k "cd node_server && npm run dev"

@REM timeout /t 3

echo Starting React frontend...
start cmd /k "cd frontend && npm run dev"

echo All servers started!
echo   Python  → http://localhost:8000
echo   Node    → http://localhost:4000
echo   React   → http://localhost:5173