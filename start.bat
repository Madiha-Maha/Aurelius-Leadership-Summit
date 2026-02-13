@echo off
REM Frontend Server
cd frontend
echo Starting Frontend on http://localhost:5000
echo.
echo Setting up a simple Python HTTP server...
python -m http.server 5000
