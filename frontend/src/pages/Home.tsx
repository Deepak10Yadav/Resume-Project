import { FileText, Sparkles, Zap } from 'lucide-react';
import { Button } from '../components/Button';

interface HomeProps {
  onNavigate: (page: 'upload') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl animate-float">
              <FileText className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Resume Screening & Ranking
            </h1>

            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Smart Resume Analysis using AI and NLP
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 animate-slide-in-left">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-lg font-medium">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 animate-slide-in-right">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-lg font-medium">Instant Rankings</span>
              </div>
            </div>

            <Button onClick={() => onNavigate('upload')} className="animate-bounce-subtle">
              Get Started
            </Button>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">01</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Upload</h3>
                <p className="text-gray-600 dark:text-gray-300">Upload Job Description and resumes (PDF, DOCX, TXT)</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">02</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Analyze</h3>
                <p className="text-gray-600 dark:text-gray-300">AI extracts skills, experience, and matches to JD</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">03</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Rank</h3>
                <p className="text-gray-600 dark:text-gray-300">Get ranked candidates with match scores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
