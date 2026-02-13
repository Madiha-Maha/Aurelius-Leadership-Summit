#!/bin/bash
cd frontend
echo "Starting Frontend on http://localhost:5000"
echo ""
echo "Setting up a simple Python HTTP server..."
python3 -m http.server 5000
