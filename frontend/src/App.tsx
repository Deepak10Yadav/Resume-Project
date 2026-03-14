import { useState } from 'react';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Results } from './pages/Results';
import { ThemeToggle } from './components/ThemeToggle';
import { Page, ResumeData } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [resumes, setResumes] = useState<ResumeData[]>([]);

  const handleUploadComplete = (uploadedResumes: ResumeData[]) => {
    setResumes(uploadedResumes);
  };

  return (
    <>
      <ThemeToggle />
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'upload' && (
        <Upload onNavigate={setCurrentPage} onUploadComplete={handleUploadComplete} />
      )}
      {currentPage === 'results' && (
        <Results onNavigate={setCurrentPage} resumes={resumes} />
      )}
    </>
  );
}

export default App;
