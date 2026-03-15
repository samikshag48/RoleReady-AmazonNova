export interface UserProfile {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    links: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
      other?: string;
    };
  };
  skills: Skill[];
  experience: ExperienceItem[];
  education: EducationItem[];
  achievements: Achievement[];
  lastSaved?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 1-5
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string; // null for current
  achievements: string[];
  technologies: string[];
  location?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate?: string;
  highlights?: string[];
  gpa?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
  category: 'award' | 'certification' | 'publication' | 'other';
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  seniority?: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  rawText: string;
  scrapedAt: string;
  source: 'linkedin' | 'generic' | 'manual';
}

export interface TailorSettings {
  template: 'clean' | 'split' | 'elegant';
  sections: {
    summary: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
    achievements: boolean;
  };
  bulletDensity: 'short' | 'normal';
  pageSize: 'a4' | 'letter';
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  onboardingCompleted: boolean;
  lastActiveJobId?: string;
}

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    duration: string;
    highlights?: string[];
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date?: string;
  }>;
  keywordCoverage: number;
  tailoredFor: {
    jobTitle: string;
    company: string;
  };
  // Backend response field
  tailored_resume?: string;
}

export interface ExtensionMessage {
  type: 'SCAN_JD' | 'JD_SCANNED' | 'UPDATE_PROFILE' | 'GENERATE_RESUME' | 'ERROR' | 'GET_PROFILE' | 'GET_JD' | 'API_REQUEST';
  payload?: any;
  endpoint?: string;
  tabId?: number;
}