import { useState } from 'react';
import { ArrowLeft, Download, Trophy, User, Mail, Phone, Briefcase, Code, Target, Award } from 'lucide-react';
import { Button } from '../components/Button';
import { ResumeData } from '../types';

interface ResultsProps {
  onNavigate: (page: 'home' | 'upload') => void;
  resumes: ResumeData[];
}

export function Results({ onNavigate, resumes }: ResultsProps) {
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(
    resumes.length > 0 ? resumes[0] : null
  );

  const sortedResumes = [...resumes].sort((a, b) => b.atsScore - a.atsScore);

  const handleDownloadCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'ATS Score', 'Predicted Role', 'Experience', 'Skills'];
    const rows = sortedResumes.map((resume, index) => [
      index + 1,
      resume.name,
      resume.email,
      resume.phone,
      resume.atsScore,
      resume.predictedRole,
      resume.experience,
      resume.skills.join('; '),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_rankings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-6 h-6" />;
    return <Award className="w-6 h-6" />;
  };

  const entities = selectedResume?.entities ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Upload More
          </button>

          <Button
            onClick={handleDownloadCSV}
            variant="secondary"
            className="flex items-center gap-2 !px-6 !py-3 !text-base"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Rankings</h2>
                <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  {resumes.length} Candidates
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {sortedResumes.map((resume, index) => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                      selectedResume?.id === resume.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankColor(index + 1)} flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {index < 3 ? getRankIcon(index + 1) : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{resume.name}</div>
                        <div
                          className={`text-sm ${
                            selectedResume?.id === resume.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {resume.predictedRole}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div
                        className={`text-sm font-medium ${
                          selectedResume?.id === resume.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        Match Score
                      </div>
                      <div className="text-2xl font-bold">{resume.atsScore}</div>
                    </div>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${resume.atsScore}%` }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedResume ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-sm font-medium text-blue-100 mb-2">
                        File: {selectedResume.fileName}
                      </div>
                      <h1 className="text-4xl font-bold mb-2">{selectedResume.name}</h1>
                      <p className="text-xl text-blue-100">{selectedResume.predictedRole}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold">{selectedResume.atsScore}</div>
                      <div className="text-sm text-blue-100">Match Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      <div>
                        <div className="text-xs text-blue-100">Email</div>
                        <div className="font-medium">{selectedResume.email || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5" />
                      <div>
                        <div className="text-xs text-blue-100">Phone</div>
                        <div className="font-medium">{selectedResume.phone || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5" />
                      <div>
                        <div className="text-xs text-blue-100">Experience</div>
                        <div className="font-medium">{selectedResume.experience}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Match Confidence
                    </h2>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Confidence</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {((selectedResume.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(selectedResume.confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.length > 0 ? (
                      selectedResume.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No skills extracted</p>
                    )}
                  </div>
                </div>

                {entities.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Extracted Info
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-semibold">
                              Type
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-semibold">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entities.map((entity, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="py-3 px-4">
                                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                  {entity.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                                {entity.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Select a candidate to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
