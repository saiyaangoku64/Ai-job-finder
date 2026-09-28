import { 
  Search, 
  MessageSquare, 
  Map as MapIcon, 
  Ghost, 
  Calculator, 
  User
} from 'lucide-react';

export const APP_NAME = "StudentJobs";

export const MOCK_USER = {
  id: 'usr_123',
  name: 'Alex Student',
  skills: ['Python', 'Content Writing', 'Data Analysis', 'Canva'],
  availability: 'Evenings & Weekends',
  isAuthenticated: true,
  credits: 10
};

export const NAVIGATION_ITEMS = [
  { id: 'JOB_SEARCH', label: 'Job Engine', icon: Search },
  { id: 'GIG_RADAR', label: 'Gig Radar', icon: MapIcon },
  { id: 'HIDDEN_MARKET', label: 'Hidden Market', icon: Ghost },
  { id: 'FREELANCE_CALC', label: 'Rate Architect', icon: Calculator },
  { id: 'INTERVIEW_SIM', label: 'Interview AI', icon: MessageSquare }, 
  { id: 'PROFILE', label: 'Profile', icon: User },
];

export const LOADING_STEPS = [
  "Initializing Firecrawl Scraper...",
  "Targeting Naukri.com & JobHai.com...",
  "Extracting Raw Markdown...",
  "Parsing Job Nodes via Gemini...",
  "Validating application URLs...",
  "Finalizing match scores..."
];