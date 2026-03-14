"""
Run the Resume Screening & Ranking backend server.

- Local:  python run_backend.py
- Render (or other PaaS): use this file as the start command.
"""

import os
import sys

# Add project root to path so we can run from anywhere
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

# Ensure imports like `from backend.app import app` work both locally and on Render
os.chdir(os.path.join(PROJECT_ROOT, "backend"))

from backend.app import app  # noqa: E402


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    print("Resume Screening & Ranking - Full Stack")
    print(f"  Web UI:  http://localhost:{port}/")
    print(f"  API:     http://localhost:{port}/api")
    print(f"  Health:  http://localhost:{port}/health")
    app.run(debug=True, host="0.0.0.0", port=port, use_reloader=False)
