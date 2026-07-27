export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  type?: 'CLT' | 'PJ' | 'Freelance' | 'Estágio' | 'Voluntário';
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status?: 'Completo' | 'Cursando' | 'Trancado' | 'Incompleto';
}

export interface SkillItem {
  id: string;
  name: string;
  level?: 'Básico' | 'Intermediário' | 'Avançado' | 'Especialista';
  category?: 'Técnica' | 'Comportamental';
}

export interface LanguageItem {
  id: string;
  name: string;
  level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo';
}

export interface ExtraItem {
  id: string;
  title: string;
  description: string;
}

export interface ResumeFormData {
  personalInfo: PersonalInfo;
  objective?: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  extras: ExtraItem[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}
