"""
Configuration for the Resume Screening and Ranking System.
Uses environment variables with sensible defaults.
"""

import os

# MongoDB Configuration
MONGODB_URI = "mongodb+srv://dy60146_db_user:Deepak10@cluster0.yukehcl.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "resume_screening_db"

# Collection names in MongoDB
RESUMES_COLLECTION = "resumes"
JOB_DESCRIPTIONS_COLLECTION = "job_descriptions"

# File upload settings
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max file size
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

# Ranking weights (adjust these to tune screening)
SKILL_MATCH_WEIGHT = 0.4      # How important skill overlap is
KEYWORD_MATCH_WEIGHT = 0.3   # How important keyword matching is
EXPERIENCE_WEIGHT = 0.2      # Weight for experience relevance
EDUCATION_WEIGHT = 0.1       # Weight for education match
