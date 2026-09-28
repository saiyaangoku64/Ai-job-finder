
export interface User {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  availability: string;
  isAuthenticated: boolean;
  credits: number; // New credit system
}

export interface StudentProfile {
  country: string;
  city: string;
  currency: string;
  university: string;
  major: string;
  year: string;
  graduationDate: string;
  bio: string;
  experience: string;
  careerGoals: string;
  targetIndustries: string[];
  minHourlyRate: string;
  weeklyHours: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  salaryNormalized?: number; 
  description: string;
  source: string;
  platforms?: string[]; 
  url: string;
  postedAt?: string; 
  isScamRisk?: boolean;
  matchScore?: number;
  isGhostJob?: boolean; 
  firstSeen?: number;   
  isVerified?: boolean; 
  applicationStatus?: 'NEW' | 'SAVED' | 'APPLIED' | 'INTERVIEWING';
  companyRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  recruiterEmail?: string;
  isRecommended?: boolean; 
}

export interface ApplicationPayload { 
  coverLetter: string;
  customAnswers: { question: string; answer: string }[];
  coldEmail: string;
}

export interface SearchPreferences {
  jobCount: '1' | '3' | '5' | '10';
  jobType: 'Part-time' | 'Freelance' | 'Internship' | 'Full-time';
  minSalary: string;
  platforms: string[]; // Added Platform Selection
}

export enum View {
  JOB_SEARCH = 'JOB_SEARCH',
  PROFILE = 'PROFILE',
  GIG_RADAR = 'GIG_RADAR',
  HIDDEN_MARKET = 'HIDDEN_MARKET',
  FREELANCE_CALC = 'FREELANCE_CALC',
  INTERVIEW_SIM = 'INTERVIEW_SIM',
  ABOUT = 'ABOUT',
  DOCS = 'DOCS'
}

export interface CompanyDNA {
  stability: string;
  employeeSentiment: string;
  hiringTrend: string;
}

export interface LocalGig {
  name: string;
  address: string;
  rating: number;
  type: string;
  hiringProbability: 'High' | 'Medium' | 'Low'; // AI Inference
  distance: string;
}

export interface HiddenMarketOpportunity {
  companyName: string;
  industry: string;
  website: string;
  outreachEmail: string;
  reasonForFit: string;
}

export interface FreelanceRate {
  hourlyRateLow: number;
  hourlyRateHigh: number;
  projectRate: number;
  annualPotential: string;
  demandTrend: 'Rising' | 'Stable' | 'Falling';
}

// Helper type for passing the credit check function to children
export type FeatureGuard = () => boolean;