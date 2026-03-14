"""
Resume Screening and Ranking System - API Backend
Flask REST API. Frontend (React) runs separately at http://localhost:5173

Run: python run_backend.py (from project root)
"""

from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import MAX_CONTENT_LENGTH
from backend.database import check_connection
from backend.routes.job_routes import job_bp
from backend.routes.resume_routes import resume_bp
from backend.routes.screening_routes import screening_bp

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Allow both local dev frontend and the deployed Vercel frontend
CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://resume-project-989.vercel.app",
    ],
)

# Register blueprints
app.register_blueprint(job_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(screening_bp)


@app.route("/")
@app.route("/api")
def api_info():
    """API info."""
    return jsonify({
        "name": "Resume Screening & Ranking API",
        "version": "1.0",
        "endpoints": {
            "jobs": "/api/jobs",
            "resumes": "/api/resumes",
            "screening": "/api/screening/rank",
        },
    })


@app.route("/health")
def health():
    """Health check - verifies MongoDB connection."""
    db_ok = check_connection()
    return jsonify({
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
