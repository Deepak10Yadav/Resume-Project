# Resume Screening & Ranking System

Full-stack app: React + TypeScript frontend + Flask + MongoDB backend.

## Quick Start

### 1. Backend (Terminal 1)

```powershell
cd "c:\Users\vijay\Downloads\Persnal Details\Project"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_backend.py
```

Backend runs at http://localhost:5000

### 2. Frontend (Terminal 2)

```powershell
cd "c:\Users\vijay\Downloads\Persnal Details\Project\frontend"
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### 3. Use the App

1. Open http://localhost:5173
2. Click **Get Started**
3. Upload a **Job Description** (PDF/DOCX/TXT) and give it a title
4. Upload **Resumes** (PDF/DOCX/TXT)
5. Click **Parse & Rank Resumes**
6. View ranked candidates with match scores

## Project Structure

```
Project/
├── backend/           # Flask API
│   ├── app.py
│   ├── routes/
│   └── services/
├── frontend/          # React + Vite + TypeScript (your frontend)
│   ├── src/
│   │   ├── api/       # API client
│   │   ├── pages/
│   │   ├── components/
│   │   └── contexts/
│   └── package.json
├── run_backend.py
└── requirements.txt
```

## Requirements

- Python 3.12+
- Node.js 18+
- MongoDB (local or Atlas)
