import { useState, useRef, DragEvent } from 'react';
import { Upload as UploadIcon, X, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { ResumeData } from '../types';
import { uploadJob, uploadResume, rankResumes } from '../api/client';

interface UploadProps {
  onNavigate: (page: 'home' | 'results') => void;
  onUploadComplete: (resumes: ResumeData[]) => void;
}

export function Upload({ onNavigate, onUploadComplete }: UploadProps) {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdTitle, setJdTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Only PDF, DOCX, and TXT files are supported');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setSuccess(`${validFiles.length} file(s) added successfully`);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        setSuccess(`${validFiles.length} file(s) added successfully`);
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!jdFile || !jdTitle.trim()) {
      setError('Please add a Job Description (title and file)');
      return;
    }
    if (files.length === 0) {
      setError('Please select at least one resume');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Upload JD
      const jobRes = await uploadJob(jdTitle.trim(), jdFile);
      const jobId = jobRes._id;

      // 2. Upload all resumes
      for (const file of files) {
        await uploadResume(file);
      }

      // 3. Rank resumes
      const rankRes = await rankResumes(jobId, files.length);

      // 4. Map to ResumeData
      const mapped: ResumeData[] = rankRes.ranked_resumes.map(r => ({
        id: r._id,
        fileName: r.filename || 'resume',
        name: r.candidate_name || 'Unknown',
        email: '',
        phone: '',
        skills: r.skills || [],
        experience: `${r.experience_years || 0} Years`,
        predictedRole: 'Candidate',
        atsScore: Math.round(r.score),
        confidence: (r.score || 0) / 100,
        entities: (r.education || []).map(e => ({ type: 'EDUCATION', value: e })),
        uploadedAt: new Date(),
      }));

      onUploadComplete(mapped);
      onNavigate('results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Cannot reach backend. Make sure it is running: python run_backend.py');
      } else {
        setError(msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="container mx-auto px-6 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume Screening & Ranking
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Upload Job Description and resumes for AI-powered ranking
            </p>
          </div>

          {/* JD Upload */}
          <div className="mb-10 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">1. Job Description</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Job Title (e.g. Data Analyst)"
                value={jdTitle}
                onChange={e => setJdTitle(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-pointer text-sm">
                  Choose JD (PDF/DOCX/TXT)
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f && validateFile(f)) {
                        setJdFile(f);
                        if (!jdTitle.trim()) setJdTitle(f.name.replace(/\.[^.]+$/, ''));
                      }
                    }}
                  />
                </label>
                {jdFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                    {jdFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">2. Resumes</h2>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 animate-slide-down">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              } hover:border-blue-400 dark:hover:border-blue-500`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 animate-float">
                  <UploadIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">
                  {isDragging ? 'Drop files here' : 'Drag & Drop resumes'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">or</p>

                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                  Choose Files
                </Button>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  PDF, DOCX, TXT (Max 10MB each)
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mb-8 space-y-3">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Selected Resumes ({files.length})
              </h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-in-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && jdFile && (
            <div className="text-center">
              <Button onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Parsing & Ranking...</span>
                  </div>
                ) : (
                  'Parse & Rank Resumes'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
