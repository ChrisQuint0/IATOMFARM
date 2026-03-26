import sys
import os

# Add the backend directory to the sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

# Import the FastAPI app instance from main.py
from main import app

# Vercel needs the app instance to be available as 'app'
# This file is essentially a proxy to our existing backend logic.
