const API_BASE = ''; // Same origin - Vite proxies /api to backend

async function parseError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.error || fallback;
  } catch {
    if (res.status === 404 || res.status === 502) return 'Backend not running. Start it with: python run_backend.py';
    return fallback + ` (${res.status})`;
  }
}

export async function uploadJob(title: string, file: File): Promise<{ _id: string }> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('title', title);
  const res = await fetch(`${API_BASE}/api/jobs/`, { method: 'POST', body: fd });
  if (!res.ok) {
    const msg = await parseError(res, 'Failed to upload job');
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadResume(file: File): Promise<{ _id: string; candidate_name: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/resumes/`, { method: 'POST', body: fd });
  if (!res.ok) {
    const msg = await parseError(res, 'Failed to upload resume');
    throw new Error(msg);
  }
  return res.json();
}

export async function rankResumes(
  jobId: string,
  topN: number = 50
): Promise<{
  job_id: string;
  job_title: string;
  total_resumes: number;
  ranked_resumes: Array<{
    _id: string;
    candidate_name: string;
    filename?: string;
    skills: string[];
    experience_years: number;
    education: string[];
    score: number;
    rank: number;
  }>;
}> {
  const res = await fetch(`${API_BASE}/api/screening/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, top_n: topN }),
  });
  if (!res.ok) {
    const msg = await parseError(res, 'Failed to rank resumes');
    throw new Error(msg);
  }
  return res.json();
}
