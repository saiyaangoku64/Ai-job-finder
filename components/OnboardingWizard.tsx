import React, { useState } from 'react';
import { ArrowRight, Globe, BookOpen, Briefcase, Target, Clock, CheckCircle2 } from 'lucide-react';
import { StudentProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

const STEPS = [
  { id: 1, title: "Location & Identity", icon: Globe },
  { id: 2, title: "Academic Background", icon: BookOpen },
  { id: 3, title: "Skills & Passion", icon: Briefcase },
  { id: 4, title: "Career North Star", icon: Target },
  { id: 5, title: "Constraints", icon: Clock },
];

export const OnboardingWizard: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>({
    country: '',
    city: '',
    currency: 'USD',
    university: '',
    major: '',
    year: 'Freshman',
    graduationDate: '',
    bio: '',
    experience: '',
    careerGoals: '',
    targetIndustries: [],
    minHourlyRate: '',
    weeklyHours: '10'
  });

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else onComplete(profile);
  };

  const renderInput = (label: string, value: string, key: keyof StudentProfile, type = "text", placeholder = "") => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => setProfile({ ...profile, [key]: e.target.value } as StudentProfile)}
          className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 text-white rounded-xl outline-none focus:border-white h-32 resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => setProfile({ ...profile, [key]: e.target.value } as StudentProfile)}
          className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 text-white rounded-xl outline-none focus:border-white"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-12">
            {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? 'bg-white border-white text-black' : 'bg-black border-neutral-800 text-neutral-600'}`}>
                        <s.icon size={18} />
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest absolute -bottom-6 whitespace-nowrap ${step === s.id ? 'text-white' : 'text-neutral-700'}`}>
                        {s.title}
                    </span>
                    {step > s.id && <div className="absolute -right-12 top-5 w-24 h-[2px] bg-white hidden md:block" />}
                </div>
            ))}
        </div>

        {/* Step Content */}
        <div className="bg-[#111] border border-neutral-800 p-8 rounded-2xl shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
                <span className="text-neutral-500">Step {step}:</span> {STEPS[step-1].title}
            </h2>

            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput("Country", profile.country, "country", "text", "United States")}
                    {renderInput("City", profile.city, "city", "text", "New York")}
                    {renderInput("Preferred Currency", profile.currency, "currency", "text", "USD, EUR, INR")}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    {renderInput("University / School", profile.university, "university")}
                    <div className="grid grid-cols-2 gap-4">
                        {renderInput("Major / Field of Study", profile.major, "major")}
                        {renderInput("Current Year", profile.year, "year", "text", "e.g. Sophomore, Final Year")}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                     {renderInput("Describe your skills & past projects", profile.experience, "experience", "textarea", "I have built 3 React apps, I know Python well, and I used to work at a coffee shop...")}
                     {renderInput("Short Bio", profile.bio, "bio", "text", "A passionate CS student aiming for...")}
                </div>
            )}

            {step === 4 && (
                <div>
                    {renderInput("Where do you see yourself in 5 years?", profile.careerGoals, "careerGoals", "textarea", "I want to be a Senior Frontend Engineer at a tech startup...")}
                </div>
            )}

            {step === 5 && (
                 <div className="grid grid-cols-2 gap-4">
                    {renderInput("Minimum Hourly Rate", profile.minHourlyRate, "minHourlyRate", "text", "$15/hr")}
                    {renderInput("Max Weekly Hours", profile.weeklyHours.toString(), "weeklyHours", "number", "20")}
                 </div>
            )}

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={nextStep}
                    className="bg-white hover:bg-neutral-200 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                    {step === 5 ? 'Initialize System' : 'Next Step'} <ArrowRight size={18} />
                </button>
            </div>
        </div>
        
        <div className="mt-8 text-center text-neutral-600 text-xs font-mono uppercase">
             AI Agents will use this data to personalize your job search & Resume
        </div>
      </div>
    </div>
  );
};