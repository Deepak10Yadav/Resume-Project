"""
Resume API Routes
Upload resumes, store in MongoDB, list resumes.
"""

from datetime import datetime

from flask import Blueprint, request, jsonify

from backend.database import get_resumes_collection
from backend.config import ALLOWED_EXTENSIONS
from backend.services.resume_parser import extract_text_from_bytes, parse_resume_text

resume_bp = Blueprint("resume", __name__, url_prefix="/api/resumes")


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@resume_bp.route("/", methods=["GET"])
def list_resumes():
    """List all resumes in the database."""
    collection = get_resumes_collection()
    resumes = list(collection.find({}, {"_id": 1, "candidate_name": 1, "created_at": 1}))
    for r in resumes:
        r["_id"] = str(r["_id"])
    return jsonify({"resumes": resumes})


@resume_bp.route("/", methods=["POST"])
def upload_resume():
    """
    Upload a resume (PDF, DOCX, or TXT).
    Extracts text, parses it, and stores in MongoDB.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    # Read in memory (no temp file - avoids Windows WinError 32)
    try:
        data = file.read()
        raw_text = extract_text_from_bytes(data, file.filename)
    except Exception as e:
        return jsonify({"error": f"Failed to extract text: {str(e)}"}), 400
    
    # Parse resume into structured format
    parsed = parse_resume_text(raw_text)
    
    # Optional: candidate name from form
    candidate_name = request.form.get("candidate_name") or file.filename
    
    resume_doc = {
        "candidate_name": candidate_name,
        "filename": file.filename,
        "full_text": parsed["full_text"],
        "skills": parsed["skills"],
        "experience_years": parsed["experience_years"],
        "education": parsed["education"],
        "created_at": datetime.utcnow(),
    }
    
    collection = get_resumes_collection()
    result = collection.insert_one(resume_doc)
    resume_doc["_id"] = str(result.inserted_id)
    return jsonify(resume_doc), 201


@resume_bp.route("/<resume_id>", methods=["GET"])
def get_resume(resume_id):
    """Get a single resume by ID."""
    from bson.objectid import ObjectId
    collection = get_resumes_collection()
    try:
        resume = collection.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        return jsonify({"error": "Invalid resume ID"}), 400
    
    if not resume:
        return jsonify({"error": "Resume not found"}), 404
    
    resume["_id"] = str(resume["_id"])
    return jsonify(resume)


@resume_bp.route("/bulk", methods=["POST"])
def add_resume_json():
    """
    Add a resume directly as JSON (e.g., from another system).
    Body: { "candidate_name": "...", "full_text": "...", "skills": [...], ... }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400
    
    full_text = data.get("full_text", "")
    parsed = parse_resume_text(full_text) if full_text else {}
    
    resume_doc = {
        "candidate_name": data.get("candidate_name", "Unknown"),
        "full_text": data.get("full_text", ""),
        "skills": data.get("skills") or parsed.get("skills", []),
        "experience_years": data.get("experience_years", parsed.get("experience_years", 0)),
        "education": data.get("education") or parsed.get("education", []),
        "created_at": datetime.utcnow(),
    }
    
    collection = get_resumes_collection()
    result = collection.insert_one(resume_doc)
    resume_doc["_id"] = str(result.inserted_id)
    return jsonify(resume_doc), 201
