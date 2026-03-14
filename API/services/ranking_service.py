"""
Ranking Service
Scores and ranks resumes against a Job Description.
Uses TF-IDF for text similarity and skill/education matching.
"""

import re
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def extract_keywords_from_text(text: str) -> list:
    """
    Extract meaningful keywords from text (JD or resume).
    Removes common stop words and punctuation.
    """
    # Simple stop words (extend as needed)
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
        "be", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "must", "shall", "can", "need",
        "this", "that", "these", "those", "it", "its", "they", "them"
    }
    
    text_lower = text.lower()
    # Remove punctuation and split
    words = re.findall(r"\b[a-z0-9]+\b", text_lower)
    return [w for w in words if w not in stop_words and len(w) > 1]


def calculate_resume_score(
    resume_data: dict,
    job_description: dict,
    weights: dict = None
) -> float:
    """
    Calculate a single resume's match score against a Job Description.
    Score is between 0 and 100.
    
    Args:
        resume_data: Parsed resume with full_text, skills, experience_years, education
        job_description: JD with full_text, required_skills (optional)
        weights: Optional dict to override default weights
        
    Returns:
        Score from 0 to 100
    """
    if weights is None:
        weights = {
            "text_similarity": 0.4,
            "skill_match": 0.35,
            "experience": 0.15,
            "education": 0.1,
        }
    
    resume_text = resume_data.get("full_text", "") or ""
    jd_text = job_description.get("full_text", "") or ""
    
    if not resume_text or not jd_text:
        return 0.0
    
    # 1. Text similarity (TF-IDF cosine similarity)
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([jd_text, resume_text])
        text_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except ValueError:
        text_sim = 0.0
    
    # 2. Skill match
    resume_skills = set(s.lower() for s in resume_data.get("skills", []))
    jd_skills = job_description.get("required_skills")
    if jd_skills:
        jd_skills_set = set(s.lower() for s in jd_skills)
    else:
        # Extract skills from JD text if not provided
        jd_keywords = extract_keywords_from_text(jd_text)
        jd_skills_set = set(jd_keywords)
    
    if jd_skills_set:
        skill_match = len(resume_skills & jd_skills_set) / len(jd_skills_set)
    else:
        skill_match = 0.5  # Neutral if no JD skills
    
    # 3. Experience score (0-1 based on JD requirement vs resume)
    jd_min_experience = job_description.get("min_experience_years", 0)
    resume_exp = resume_data.get("experience_years", 0)
    if jd_min_experience == 0:
        experience_score = 1.0 if resume_exp > 0 else 0.5
    else:
        ratio = resume_exp / jd_min_experience
        experience_score = min(1.0, ratio)  # Full score if meets or exceeds
    
    # 4. Education match
    resume_edu = set(e.lower() for e in resume_data.get("education", []))
    jd_edu = job_description.get("required_education") or set()
    if isinstance(jd_edu, list):
        jd_edu = set(e.lower() for e in jd_edu)
    else:
        jd_edu = set()
    
    if jd_edu:
        education_score = len(resume_edu & jd_edu) / len(jd_edu)
    else:
        education_score = 1.0 if resume_edu else 0.5
    
    # Weighted total
    total = (
        weights["text_similarity"] * text_sim +
        weights["skill_match"] * skill_match +
        weights["experience"] * experience_score +
        weights["education"] * education_score
    )
    
    # Scale to 0-100
    return round(total * 100, 2)


def rank_resumes(
    resumes: List[dict],
    job_description: dict,
    top_n: int = None
) -> List[dict]:
    """
    Score and rank all resumes against a Job Description.
    
    Args:
        resumes: List of resume documents (must have full_text and parsed fields)
        job_description: Job Description document
        top_n: Return only top N results (None = return all)
        
    Returns:
        List of resumes with 'score' and 'rank' added, sorted by score descending
    """
    scored = []
    for resume in resumes:
        score = calculate_resume_score(resume, job_description)
        resume_copy = dict(resume)
        resume_copy["score"] = score
        resume_copy["_id"] = str(resume.get("_id", ""))  # Convert ObjectId to string for JSON
        scored.append(resume_copy)
    
    # Sort by score descending
    ranked = sorted(scored, key=lambda x: x["score"], reverse=True)
    
    # Add rank number
    for i, r in enumerate(ranked, start=1):
        r["rank"] = i
    
    if top_n:
        return ranked[:top_n]
    return ranked
