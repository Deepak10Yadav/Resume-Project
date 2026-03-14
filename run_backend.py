"""
Run the Resume Screening & Ranking backend server.
Execute from project root: python run_backend.py
"""

import sys
import os

# Add project root to path so we can run from anywhere
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)
os.chdir(os.path.join(project_root, "backend"))

from backend.app import app

if __name__ == "__main__":
    print("Resume Screening & Ranking - Full Stack")
    print("  Web UI:  http://localhost:5000/")
    print("  API:     http://localhost:5000/api")
    print("  Health:  http://localhost:5000/health")
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
