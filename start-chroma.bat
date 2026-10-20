@echo off
echo ==============================================
echo  Starting ChromaDB Persistent Vector Database
echo ==============================================
echo ChromaDB will listen on: http://localhost:8000
echo Persistent data folder: ./chroma_data
echo Press Ctrl+C to stop.
echo.
chroma run --path ./chroma_data --port 8000
pause
