import React, { useState, useEffect } from 'react';
import { StorageService } from '../../lib/storage';
import { UserProfile, Skill, ExperienceItem, EducationItem, Achievement } from '../../types';
import { TextField } from '../../components/forms/TextField';
import { TagInput } from '../../components/forms/TagInput';
import { DateRangePicker } from '../../components/forms/DateRangePicker';
import { RatingStars } from '../../components/forms/RatingStars';
import { TextareaWithCounter } from '../../components/forms/TextareaWithCounter';
import { Plus, Trash2, Save, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import { useDebouncedSave } from '../../hooks/useStorage';

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

export function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [activeSection, setActiveSection] = useState('basics');
  const [loading, setLoading] = useState(true);

  const { saving, lastSaved } = useDebouncedSave(
    profile,
    StorageService.saveUserProfile,
    2000
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await StorageService.getUserProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
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

  const removeSkill = (id: string) => {
    updateProfile({
      skills: profile.skills.filter(skill => skill.id !== id)
    });
  };

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

  const removeExperience = (id: string) => {
    updateProfile({
      experience: profile.experience.filter(exp => exp.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  const sections = [
    { id: 'basics', label: 'Basics', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap }
  ];

  return (
    <div className="flex h-full">
      {/* Section Navigation */}
      <div className="w-24 border-r border-slate-200 bg-slate-50">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full p-3 flex flex-col items-center gap-1 text-xs transition-colors
                ${activeSection === section.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <Icon size={16} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Save Status */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              {saving ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Basics Section */}
          {activeSection === 'basics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label="Full Name"
                  value={profile.basics.name}
                  onChange={(e) => updateProfile({
                    basics: { ...profile.basics, name: e.target.value }
                  })}
                  required
                />
                
                <TextField
                  label="Professional Title"
                  value={profile.basics.title}
                  onChange={(e) => updateProfile({
                    basics: { ...profile.basics, title: e.target.value }
                  })}
                  placeholder="e.g., Senior Software Engineer"
                />
                
                <TextField
                  label="Email"
                  type="email"
                  value={profile.basics.email}
                  onChange={(e) => updateProfile({
                    basics: { ...profile.basics, email: e.target.value }
                  })}
                  required
                />
                
                <TextField
                  label="Phone"
                  type="tel"
                  value={profile.basics.phone}
                  onChange={(e) => updateProfile({
                    basics: { ...profile.basics, phone: e.target.value }
                  })}
                />
                
                <TextField
                  label="Location"
                  value={profile.basics.location}
                  onChange={(e) => updateProfile({
                    basics: { ...profile.basics, location: e.target.value }
                  })}
                  placeholder="e.g., San Francisco, CA"
                />
                
                <TextField
                  label="LinkedIn URL"
                  value={profile.basics.links.linkedin || ''}
                  onChange={(e) => updateProfile({
                    basics: {
                      ...profile.basics,
                      links: { ...profile.basics.links, linkedin: e.target.value }
                    }
                  })}
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
                />
              </div>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Skills</h3>
                <button
                  onClick={addSkill}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  <Plus size={14} />
                  Add Skill
                </button>
              </div>

              <div className="space-y-3">
                {profile.skills.map((skill) => (
                  <div key={skill.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <TextField
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                          />
                          <select
                            value={skill.category}
                            onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Technical">Technical</option>
                            <option value="Language">Language</option>
                            <option value="Framework">Framework</option>
                            <option value="Tool">Tool</option>
                            <option value="Soft Skill">Soft Skill</option>
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
                      
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  <Plus size={14} />
                  Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-slate-800">Experience #{index + 1}</h4>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <TextField
                          label="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        />
                        <TextField
                          label="Role/Title"
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
                        label="Technologies Used"
                        tags={exp.technologies}
                        onChange={(technologies) => updateExperience(exp.id, { technologies })}
                        placeholder="Add technology..."
                      />

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Key Achievements
                        </label>
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex gap-2 mb-2">
                            <TextareaWithCounter
                              value={achievement}
                              onChange={(e) => {
                                const newAchievements = [...exp.achievements];
                                newAchievements[achIndex] = e.target.value;
                                updateExperience(exp.id, { achievements: newAchievements });
                              }}
                              placeholder="Describe your achievement with impact metrics..."
                              rows={2}
                              maxLength={200}
                            />
                            {exp.achievements.length > 1 && (
                              <button
                                onClick={() => {
                                  const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                                  updateExperience(exp.id, { achievements: newAchievements });
                                }}
                                className="p-1 text-slate-400 hover:text-red-500 mt-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => updateExperience(exp.id, { 
                            achievements: [...exp.achievements, ''] 
                          })}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add achievement
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}