import { GoogleGenAI } from "@google/genai";
import { 
    JobListing, 
    SearchPreferences, 
    User, 
    CompanyDNA, 
    LocalGig, 
    HiddenMarketOpportunity, 
    FreelanceRate,
    ApplicationPayload
} from "../types";
import { supabase } from './supabase';

// SAFELY ACCESS API KEY TO PREVENT CRASHES
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) { console.warn("Environment access failed"); }
  return '';
};

const apiKey = getApiKey();

// Initialize AI safely - provide dummy key if missing to prevent constructor crash
// API calls will fail gracefully later if key is invalid, rather than crashing app on load
export const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-init' });

const FIRECRAWL_API_KEY = 'fc-eb14e4ed7a8e47af90c4ba8f955f065e';

export const checkApiKey = () => !!apiKey;

// --- UTILITIES ---

const removeMarkdown = (text: string): string => {
    if (!text) return "";
    return text
        .replace(/\*\*/g, '')   
        .replace(/\*/g, '')     
        .replace(/__/g, '')     
        .replace(/`/g, '')      
        .replace(/^#+\s/gm, '') 
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();
};

const cleanUrl = (url: string): string => {
    if (!url) return "#";
    // Fix Google Redirects to ensure exact page application
    if (url.includes('google.com/url?q=')) {
        const match = url.match(/q=([^&]*)/);
        if (match && match[1]) return decodeURIComponent(match[1]);
    }
    return url;
};

const cleanArrayJSON = (text: string): any[] => {
  try {
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    }
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) { return []; }
};

const cleanAndParseJSON = (text: string): any => {
    try {
      const firstBracket = text.indexOf('{');
      const lastBracket = text.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
      return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) { return null; }
};

const normalizeSalary = (salaryStr: string): number => {
    if (!salaryStr) return 0;
    const clean = salaryStr.toLowerCase().replace(/,/g, '');
    const numbers = clean.match(/\d+/g);
    if (!numbers) return 0;
    let val = parseInt(numbers[0]);
    if (clean.includes('k')) val *= 1000;
    if (clean.includes('lpa') || clean.includes('lakh')) val = (val * 100000) / 12; 
    if (clean.includes('year') || clean.includes('annum')) val = val / 12;
    return Math.round(val);
};

// --- FIRECRAWL + GEMINI SEARCH ENGINE ---

export const searchJobsWithAI = async (query: string, location: string, prefs: SearchPreferences): Promise<{ jobs: JobListing[] }> => {
  if (!apiKey) throw new Error("API Key missing");

  console.log(`🔎 Search Request: "${query}" in "${location}"`);
  
  // STEP 1: CHECK SUPABASE DATABASE (Production Cache)
  // This saves credits and provides instant results from our Python Scraper
  try {
      // Basic text match on Title or Company
      // Note: Full Text Search (textSearch) requires creating an index in Supabase. 
      // Using .ilike for simpler partial matching without setup.
      const { data: dbJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .ilike('title', `%${query}%`)
        .eq('is_active', true)
        .limit(10);

      if (dbJobs && dbJobs.length > 0) {
          console.log(`✅ Found ${dbJobs.length} jobs in Database.`);
          
          const mappedJobs: JobListing[] = dbJobs.map((job: any) => ({
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location || location,
              salary: job.salary,
              salaryNormalized: normalizeSalary(job.salary),
              description: job.description || "Verified Database Listing",
              source: job.source || "StudentGig DB",
              platforms: [job.source],
              url: job.url,
              postedAt: job.posted_at,
              matchScore: 95, // DB jobs are usually higher quality matches
              isVerified: true,
              isGhostJob: false, // We assume DB jobs are curated/active
              applicationStatus: 'NEW'
          }));

          // If we found enough jobs in DB, return them and skip scraping
          // logic: If user wants 3 jobs, and we found 1, we might still want to scrape.
          // For now, if we have ANY DB results, we prefer them for speed.
          if (mappedJobs.length >= 1) {
              return { jobs: mappedJobs };
          }
      }
  } catch (dbError) {
      console.warn("⚠️ Database check failed (Running in Demo/Offline mode?):", dbError);
  }

  // STEP 2: LIVE SCRAPE (Fall back if DB is empty)
  console.log("⚠️ Database empty for this query. Initiating Live Firecrawl Scrape...");

  try {
    // 1. Determine best scraping target based on User Preferences
    let siteOperators: string[] = [];

    // Map platforms to site operators
    if (prefs.platforms && prefs.platforms.length > 0) {
        if (prefs.platforms.includes("Naukri")) siteOperators.push("site:naukri.com");
        if (prefs.platforms.includes("LinkedIn")) siteOperators.push("site:linkedin.com/jobs");
        if (prefs.platforms.includes("JobHai")) siteOperators.push("site:jobhai.com");
        if (prefs.platforms.includes("Internshala")) siteOperators.push("site:internshala.com");
        if (prefs.platforms.includes("Foundit")) siteOperators.push("site:foundit.in");
        if (prefs.platforms.includes("Glassdoor")) siteOperators.push("site:glassdoor.co.in");
    }

    // Default if no platforms selected or "All"
    if (siteOperators.length === 0) {
        siteOperators = [
            "site:naukri.com",
            "site:jobhai.com",
            "site:linkedin.com/jobs",
            "site:internshala.com",
            "site:foundit.in"
        ];
    }
    
    // Construct complex OR query
    const targetQuery = `${query} jobs in ${location} ${prefs.jobType} (${siteOperators.join(' OR ')})`;
    
    // APPEND &tbs=qdr:d15 TO FORCE RESULTS FROM PAST 15 DAYS ONLY
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(targetQuery)}&tbs=qdr:d15`;
    
    console.log("Scraping Target (Last 15 Days):", searchUrl);

    // 2. SCRAPE WITH FIRECRAWL
    let rawMarkdown = "";
    try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: searchUrl,
                formats: ['markdown'],
                // specific options to try and get better results
                waitFor: 2000 
            })
        });

        const firecrawlData = await firecrawlResponse.json();
        if (firecrawlData.success && firecrawlData.data) {
             rawMarkdown = firecrawlData.data.markdown || "";
        }
    } catch (e) {
        console.warn("Firecrawl failed to scrape.");
    }
    
    // 3. PARSE WITH GEMINI
    if (!rawMarkdown) {
        return { jobs: [] }; // No data found, return empty array immediately
    }

    // Enhanced prompt to handle date extraction and multi-source attribution
    const prompt = `
      Analyze this raw scraped markdown from a Google Search result page (Filtered for Past 15 Days).
      Target Sites: Naukri, JobHai, LinkedIn, Internshala, Foundit, Shine, Glassdoor.
      Extract exactly ${prefs.jobCount} job listings.
      
      MARKDOWN SOURCE:
      ${rawMarkdown.substring(0, 30000)} // Limit context window
      
      INSTRUCTIONS:
      - Identify distinct search results representing job postings.
      - Extract Title, Company, Location, Salary (if visible in snippet).
      - CRITICAL: Extract "Posted At" date (e.g. "2 days ago", "14 hours ago", "Oct 24"). If missing, look for clues in snippet. 
      - STRICT FILTER: If a job is clearly older than 15 days or undated, SKIP IT. We only want recent results.
      - Determine the 'source' explicitly from the URL (e.g., "LinkedIn", "Internshala", "Naukri").
      - CRITICAL: Extract the DIRECT job link (href) as 'url'. Do not fabricate links.
      
      OUTPUT JSON ARRAY:
      [
        {
          "title": "...",
          "company": "...",
          "location": "...",
          "salary": "...",
          "source": "Platform Name",
          "description": "Short summary from snippet",
          "url": "Direct link from markdown href",
          "postedAt": "e.g. 2 days ago"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsedJobs = cleanArrayJSON(response.text || "[]");

    const processedJobs: JobListing[] = parsedJobs.map((job: any, index: number) => ({
        id: `job-${index}-${Date.now()}`,
        title: removeMarkdown(job.title) || "Opportunity",
        company: removeMarkdown(job.company) || "Unknown",
        location: removeMarkdown(job.location) || location,
        salary: removeMarkdown(job.salary) || "Competitive",
        salaryNormalized: normalizeSalary(job.salary),
        description: removeMarkdown(job.description) || "View details on platform.",
        source: job.source || "Web",
        platforms: [job.source || "Web"],
        url: cleanUrl(job.url), // Clean redirect URL
        postedAt: job.postedAt || "Recently",
        matchScore: Math.floor(Math.random() * (98 - 85) + 85),
        isVerified: !!job.url,
        isGhostJob: false,
        applicationStatus: 'NEW'
    }));

    return { jobs: processedJobs };

  } catch (error) {
    console.error("Firecrawl/Gemini Search Error:", error);
    return { jobs: [] };
  }
};

export const getPersonalizedJobs = async (user: User): Promise<JobListing[]> => {
    // Simplified recommender
    return [];
};

// --- FEATURE 7: GIG RADAR (Google Maps Grounding) ---

export const findLocalGigs = async (location: string, type: string): Promise<LocalGig[]> => {
    if(!apiKey) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: `Find 5 ${type} places near ${location} that likely hire students/part-time.
            Analyze their size and busy-ness to guess hiring probability.
            Rule: Plain text output only.`,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: { latitude: 28.6139, longitude: 77.2090 } 
                    }
                }
            }
        });
        
        const response2 = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Context: ${response.text}.
            Extract the places into JSON array:
            [{ "name": "Cafe X", "address": "Block B... (Address Only)", "rating": 4.5, "type": "Cafe", "hiringProbability": "High", "distance": "2km" }]
            STRICT CONSTRAINT: Remove all phone numbers, email addresses, and postal codes from the 'address' field. Keep it clean text.`,
             config: { responseMimeType: "application/json" }
        });
        
        const data = cleanArrayJSON(response2.text || "[]");
        return data.map((d: any) => ({
            ...d,
            name: removeMarkdown(d.name),
            address: removeMarkdown(d.address)
        }));
    } catch (e) { return []; }
};

// --- FEATURE 8: HIDDEN MARKET HUNTER ---

export const findHiddenMarket = async (userSkills: string[], location: string): Promise<HiddenMarketOpportunity[]> => {
    if(!apiKey) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Find 3 local small businesses or agencies in ${location} that might need skills: ${userSkills.join(', ')}.
            They should NOT have active job listings (Hidden Market).
            Generate a short cold email pitch for each.
            Output JSON: [{ "companyName": "", "industry": "", "website": "", "outreachEmail": "", "reasonForFit": "" }]`,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });
        const data = cleanArrayJSON(response.text || "[]");
        return data.map((d: any) => ({
             ...d,
             outreachEmail: removeMarkdown(d.outreachEmail),
             reasonForFit: removeMarkdown(d.reasonForFit)
        }));
    } catch (e) { return []; }
};

// --- FEATURE 9: FREELANCE RATE ARCHITECT ---

export const calculateFreelanceRates = async (skill: string, country: string = "Global"): Promise<FreelanceRate | null> => {
    if(!apiKey) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Calculate freelance rates for "${skill}" (Beginner/Student level) specifically for market: ${country}.
            Adjust currency symbol and rates for ${country}.
            Output JSON: { "hourlyRateLow": number, "hourlyRateHigh": number, "projectRate": number, "annualPotential": "string", "demandTrend": "Rising/Stable/Falling" }`,
            config: { 
                 responseMimeType: "application/json" 
            }
        });
        const data = cleanAndParseJSON(response.text || "{}");
        if(data) data.annualPotential = removeMarkdown(data.annualPotential);
        return data;
    } catch (e) { return null; }
};

// --- FEATURE: INTERVIEW SIM (Kept) ---

export const getInterviewQuestion = async (role: string, context: string): Promise<string> => {
    if (!apiKey) return "System Offline";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Hiring Manager for ${role}. Context: ${context}. Ask next question. Plain text.`,
        });
        return removeMarkdown(response.text || "");
    } catch (e) { return "Simulation failed."; }
};

// --- SERVICES FOR JOB CARD ---

export const analyzeCompanyDNA = async (company: string): Promise<CompanyDNA | null> => {
    if (!apiKey) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Conduct corporate health check on "${company}" using recent 2024-2025 news.
            Output JSON only. Plain text strings. NO MARKDOWN.
            { "stability": "...", "employeeSentiment": "...", "hiringTrend": "..." }`,
             config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const data = cleanAndParseJSON(response.text || "[]");
        if (data) {
            data.stability = removeMarkdown(data.stability);
            data.employeeSentiment = removeMarkdown(data.employeeSentiment);
            data.hiringTrend = removeMarkdown(data.hiringTrend);
        }
        return data;
    } catch (e) { return null; }
};

export const generateSalaryNegotiation = async (jobTitle: string, salary: string): Promise<string> => {
     if (!apiKey) return "";
     try {
         const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: `Salary negotiation email for ${jobTitle} (${salary}). Request 10% more. Plain text only. NO MARKDOWN.`
         });
         return removeMarkdown(response.text || "");
     } catch (e) { return ""; }
};

export const generateGhostFill = async (job: JobListing, user: User): Promise<ApplicationPayload> => {
    if (!apiKey) throw new Error("API Key missing");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Job: ${job.title} at ${job.company}. Candidate: ${user.name}.
            Generate JSON: { "coverLetter": "...", "customAnswers": [], "coldEmail": "..." }
            Plain text only.`,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    } catch (e) { return { coverLetter: "Error", customAnswers: [], coldEmail: "" }; }
};

export const quickSkillMatch = async (skills: string[]): Promise<string> => {
     if (!apiKey) return "";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: `Suggest 1 unique gig for: ${skills.join(', ')}. Plain text.`
      });
      return removeMarkdown(response.text || "");
    } catch (error) { return ""; }
};

export const generateDatabaseSQL = async (prompt: string): Promise<string> => {
    if (!apiKey) return "-- API Key missing";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a PostgreSQL SQL query for Supabase based on this request: "${prompt}".
            Output ONLY the raw SQL code. No markdown formatting, no explanation.`,
        });
        let sql = response.text || "";
        return sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    } catch (e) {
        return "-- Error generating SQL";
    }
};