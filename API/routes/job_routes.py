"""
Job Description API Routes
HR uploads job descriptions - stored in MongoDB.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify

from backend.database import get_job_descriptions_collection
from backend.config import ALLOWED_EXTENSIONS
from backend.services.resume_parser import extract_text_from_bytes
from backend.services.ranking_service import extract_keywords_from_text

job_bp = Blueprint("job", __name__, url_prefix="/api/jobs")


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@job_bp.route("/", methods=["GET"])
def list_jobs():
    """List all job descriptions."""
    collection = get_job_descriptions_collection()
    jobs = list(collection.find({}, {"_id": 1, "title": 1, "created_at": 1}))
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jsonify({"jobs": jobs})


@job_bp.route("/", methods=["POST"])
def create_job():
    """
    Create a new job description.
    Accepts either:
    - JSON body: { "title": "...", "full_text": "...", "required_skills": [...], "min_experience_years": N }
    - Form data with file upload (PDF, DOCX, TXT)
    """
    try:
        collection = get_job_descriptions_collection()
    except Exception as e:
        return jsonify({"error": f"MongoDB connection failed: {str(e)}"}), 503

    try:
        # Option 1: File upload
        if "file" in request.files:
            file = request.files["file"]
            if file.filename == "":
                return jsonify({"error": "No file selected"}), 400
            if not allowed_file(file.filename):
                return jsonify({"error": f"File type not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

            # Read in memory (no temp file - avoids Windows WinError 32)
            try:
                data = file.read()
                full_text = extract_text_from_bytes(data, file.filename)
            except Exception as e:
                return jsonify({"error": f"Could not read file: {str(e)}"}), 400
        
            title = request.form.get("title") or f"Job from {file.filename}"
            required_skills = request.form.get("required_skills")
            if required_skills:
                required_skills = [s.strip() for s in required_skills.split(",") if s.strip()]
            else:
                required_skills = extract_keywords_from_text(full_text)[:30]
            min_experience_years = request.form.get("min_experience_years", 0, type=int)
        else:
            # Option 2: JSON body
            data = request.get_json()
            if not data:
                return jsonify({"error": "Provide JSON body or file upload"}), 400
            title = data.get("title", "Untitled Job")
            full_text = data.get("full_text", "")
            required_skills = data.get("required_skills", [])
            min_experience_years = data.get("min_experience_years", 0)
            if not full_text:
                return jsonify({"error": "full_text is required"}), 400

        job_doc = {
            "title": title,
            "full_text": full_text,
            "required_skills": required_skills,
            "min_experience_years": min_experience_years,
            "created_at": datetime.utcnow(),
        }
        result = collection.insert_one(job_doc)
        job_doc["_id"] = str(result.inserted_id)
        return jsonify(job_doc), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@job_bp.route("/<job_id>", methods=["GET"])
def get_job(job_id):
    """Get a single job description by ID."""
    from bson.objectid import ObjectId
    collection = get_job_descriptions_collection()
    try:
        job = collection.find_one({"_id": ObjectId(job_id)})
    except Exception:
        return jsonify({"error": "Invalid job ID"}), 400
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    job["_id"] = str(job["_id"])
    return jsonify(job)
