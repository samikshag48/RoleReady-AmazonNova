import React, { useState } from 'react';
import { UserProfile, ExperienceItem, Skill } from '../types';
import { TextField } from '../components/forms/TextField';
import { TagInput } from '../components/forms/TagInput';
import { DateRangePicker } from '../components/forms/DateRangePicker';
import { RatingStars } from '../components/forms/RatingStars';
import { TextareaWithCounter } from '../components/forms/TextareaWithCounter';
import { StorageService } from '../lib/storage';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

const emptyProfile: UserProfile = {
  basics: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    links: {}
  },
  skills: [],
  experience: [],
  education: [],
  achievements: []
};

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);

  const steps = [
    { title: 'Basic Information', component: StepBasics },
    { title: 'Experience & Skills', component: StepExperience },
    { title: 'Review & Complete', component: StepReview }
  ];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await StorageService.saveUserProfile(profile);
      onComplete(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${index <= currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-2
                    ${index < currentStep ? 'bg-blue-500' : 'bg-slate-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">{steps[currentStep].title}</h2>
          <p className="text-slate-600">Step {currentStep + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 mb-8">
        <StepComponent profile={profile} updateProfile={updateProfile} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            ${currentStep === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }
          `}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={completeOnboarding}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
          >
            <Check size={20} />
            Complete Setup
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components
function StepBasics({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <TextField
          label="Full Name"
          value={profile.basics.name}
          onChange={(e) => updateProfile({
            basics: { ...profile.basics, name: e.target.value }
          })}
          placeholder="John Doe"
          required
        />
        
        <TextField
          label="Professional Title"
          value={profile.basics.title}
          onChange={(e) => updateProfile({
            basics: { ...profile.basics, title: e.target.value }
          })}
          placeholder="Senior Software Engineer"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TextField
          label="Email"
          type="email"
          value={profile.basics.email}
          onChange={(e) => updateProfile({
            basics: { ...profile.basics, email: e.target.value }
          })}
          placeholder="john.doe@email.com"
          required
        />
        
        <TextField
          label="Phone"
          type="tel"
          value={profile.basics.phone}
          onChange={(e) => updateProfile({
            basics: { ...profile.basics, phone: e.target.value }
          })}
          placeholder="(555) 123-4567"
        />
      </div>

      <TextField
        label="Location"
        value={profile.basics.location}
        onChange={(e) => updateProfile({
          basics: { ...profile.basics, location: e.target.value }
        })}
        placeholder="San Francisco, CA"
      />

      <div className="grid grid-cols-2 gap-6">
        <TextField
          label="LinkedIn URL"
          value={profile.basics.links.linkedin || ''}
          onChange={(e) => updateProfile({
            basics: {
              ...profile.basics,
              links: { ...profile.basics.links, linkedin: e.target.value }
            }
          })}
          placeholder="https://linkedin.com/in/johndoe"
        />
        
        <TextField
          label="GitHub URL"
          value={profile.basics.links.github || ''}
          onChange={(e) => updateProfile({
            basics: {
              ...profile.basics,
              links: { ...profile.basics.links, github: e.target.value }
            }
          })}
          placeholder="https://github.com/johndoe"
        />
      </div>
    </div>
  );
}

function StepExperience({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      company: '',
      role: '',
      startDate: '',
      achievements: [''],
      technologies: []
    };
    updateProfile({
      experience: [...profile.experience, newExp]
    });
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    updateProfile({
      experience: profile.experience.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      category: 'Technical',
      proficiency: 3
    };
    updateProfile({
      skills: [...profile.skills, newSkill]
    });
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    updateProfile({
      skills: profile.skills.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      )
    });
  };

  return (
    <div className="space-y-8">
      {/* Experience Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Work Experience</h3>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Experience
          </button>
        </div>

        <div className="space-y-6">
          {profile.experience.map((exp) => (
            <div key={exp.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                />
                <TextField
                  label="Role"
                  value={exp.role}
                  onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                />
              </div>

              <DateRangePicker
                label="Employment Period"
                startDate={exp.startDate}
                endDate={exp.endDate}
                onStartDateChange={(date) => updateExperience(exp.id, { startDate: date })}
                onEndDateChange={(date) => updateExperience(exp.id, { endDate: date })}
                isCurrent={!exp.endDate}
                onCurrentChange={(current) => updateExperience(exp.id, { endDate: current ? undefined : '' })}
              />

              <TagInput
                label="Technologies"
                tags={exp.technologies}
                onChange={(technologies) => updateExperience(exp.id, { technologies })}
                placeholder="Add technology..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Skills</h3>
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.skills.map((skill) => (
            <div key={skill.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  placeholder="Skill name"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                />
                <select
                  value={skill.category}
                  onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="Technical">Technical</option>
                  <option value="Language">Language</option>
                  <option value="Framework">Framework</option>
                  <option value="Tool">Tool</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Proficiency:</span>
                <RatingStars
                  rating={skill.proficiency}
                  onChange={(rating) => updateSkill(skill.id, { proficiency: rating })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ profile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Profile Complete!</h3>
        <p className="text-slate-600">Review your information below. You can always edit it later.</p>
      </div>

      {/* Basic Info */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="font-semibold text-slate-800 mb-3">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Name:</span>
            <p className="font-medium">{profile.basics.name || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-slate-600">Title:</span>
            <p className="font-medium">{profile.basics.title || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-slate-600">Email:</span>
            <p className="font-medium">{profile.basics.email || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-slate-600">Location:</span>
            <p className="font-medium">{profile.basics.location || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-3">Experience ({profile.experience.length})</h4>
          <div className="space-y-3">
            {profile.experience.map((exp, index) => (
              <div key={exp.id} className="text-sm">
                <p className="font-medium">{exp.role} at {exp.company}</p>
                <p className="text-slate-600">{exp.startDate} - {exp.endDate || 'Present'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-3">Skills ({profile.skills.length})</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill.name} ({skill.proficiency}/5)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}