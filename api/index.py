import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the backend directory to the sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

# Import the original FastAPI app from main.py
from main import app as backend_app

# Create a new FastAPI instance for Vercel
app = FastAPI()

# Configure CORS for the outer app as well
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the backend app under the /api prefix.
# This ensures that /api/upload -> backend_app's /upload
app.mount("/api", backend_app)

# Fallback for /api itself or other routes
@app.get("/api/health")
async def health():
    return {"status": "ok", "source": "vercel-bridge"}
