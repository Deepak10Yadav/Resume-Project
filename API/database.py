"""
MongoDB database connection and helpers.
Provides a simple, reusable connection to the resume screening database.
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from backend.config import MONGODB_URI, DATABASE_NAME, RESUMES_COLLECTION, JOB_DESCRIPTIONS_COLLECTION


# Global database connection (initialized on first use)
_client = None
_db = None


def get_database():
    """
    Get MongoDB database instance. Creates connection if it doesn't exist.
    Returns the database object for resume_screening_db.
    """
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client[DATABASE_NAME]
    return _db


def get_resumes_collection():
    """Get the resumes collection."""
    return get_database()[RESUMES_COLLECTION]


def get_job_descriptions_collection():
    """Get the job descriptions collection."""
    return get_database()[JOB_DESCRIPTIONS_COLLECTION]


def check_connection():
    """Verify MongoDB connection is working. Returns True if connected."""
    try:
        get_database().client.admin.command("ping")
        return True
    except ConnectionFailure:
        return False
