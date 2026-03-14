"""
Screening API Routes
Screen and rank resumes against a Job Description.
"""

from flask import Blueprint, request, jsonify

from backend.database import get_resumes_collection, get_job_descriptions_collection
from backend.services.ranking_service import rank_resumes
from bson.objectid import ObjectId

screening_bp = Blueprint("screening", __name__, url_prefix="/api/screening")


@screening_bp.route("/rank", methods=["POST"])
def rank_resumes_for_job():
    """
    Rank all resumes (or selected ones) against a Job Description.
    
    JSON body:
    - job_id: (required) Job Description ID
    - resume_ids: (optional) List of resume IDs. If omitted, uses ALL resumes.
    - top_n: (optional) Return only top N results
    """
    data = request.get_json() or {}
    job_id = data.get("job_id")
    resume_ids = data.get("resume_ids")  # Optional
    top_n = data.get("top_n")
    
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400
    
    jobs_col = get_job_descriptions_collection()
    resumes_col = get_resumes_collection()
    
    # Fetch job description
    try:
        job = jobs_col.find_one({"_id": ObjectId(job_id)})
    except Exception:
        return jsonify({"error": "Invalid job_id"}), 400
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Fetch resumes
    if resume_ids:
        try:
            object_ids = [ObjectId(rid) for rid in resume_ids]
            resumes = list(resumes_col.find({"_id": {"$in": object_ids}}))
        except Exception:
            return jsonify({"error": "Invalid resume_id in resume_ids"}), 400
    else:
        resumes = list(resumes_col.find({}))
    
    if not resumes:
        return jsonify({"message": "No resumes to rank", "ranked_resumes": []})
    
    # Rank resumes
    ranked = rank_resumes(resumes, job, top_n=top_n)
    
    return jsonify({
        "job_id": job_id,
        "job_title": job.get("title", "Untitled"),
        "total_resumes": len(resumes),
        "ranked_resumes": ranked,
    })


@screening_bp.route("/quick-rank/<job_id>", methods=["GET"])
def quick_rank(job_id):
    """
    Quick rank: GET request with job_id.
    Ranks all resumes against this job and returns top 10.
    """
    jobs_col = get_job_descriptions_collection()
    resumes_col = get_resumes_collection()
    
    try:
        job = jobs_col.find_one({"_id": ObjectId(job_id)})
    except Exception:
        return jsonify({"error": "Invalid job_id"}), 400
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    resumes = list(resumes_col.find({}))
    ranked = rank_resumes(resumes, job, top_n=10)
    
    return jsonify({
        "job_id": job_id,
        "job_title": job.get("title", "Untitled"),
        "top_candidates": ranked,
    })
