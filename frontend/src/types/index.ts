export interface ResumeData {
  id: string;
  fileName: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  predictedRole: string;
  atsScore: number;
  confidence: number;
  entities: {
    type: string;
    value: string;
  }[];
  uploadedAt: Date;
}

export type Page = 'home' | 'upload' | 'results';
