/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  profession: string;
  experienceLevel: "Entry" | "Mid" | "Senior" | "Executive";
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Bullet points or text
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  technologies: string; // Comma separated
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic";
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
}

export interface ResumeData {
  id: string;
  title: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages: Language[];
  certifications: Certification[];
  awards: Award[];
  volunteerExperience: VolunteerExperience[];
  references: Reference[];
  template: "modern" | "executive" | "creative" | "minimal" | "classic";
}

export interface CoverLetterData {
  id: string;
  title: string;
  companyName: string;
  jobTitle: string;
  hiringManager: string;
  jobDescription: string;
  resumeContext: string;
  tone: "Professional" | "Enthusiastic" | "Executive" | "Creative" | "Technical";
  content: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  salary: string;
  deadline: string;
  status: "wishlist" | "applied" | "interview" | "assessment" | "offer" | "rejected";
  notes: string;
  updatedAt: string;
}

export interface ATSFeedback {
  score: number;
  missingKeywords: string[];
  formattingIssues: string[];
  weakBulletPoints: { original: string; suggestion: string }[];
  recommendations: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "Technical" | "Behavioral" | "General";
  starAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  } | string;
}
