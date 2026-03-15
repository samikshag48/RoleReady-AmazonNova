import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { sampleProfile } from '../lib/sampleData';
import { UserProfile } from '../types';
import { Logo } from '../components/common/Logo';
import { OnboardingWizard } from './OnboardingWizard';
import { ProfileEditor } from './ProfileEditor';
import { Settings, User, BookOpen } from 'lucide-react';

export function OptionsApp() {
  const [currentView, setCurrentView] = useState<'onboarding' | 'profile' | 'settings'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [userProfile, appSettings] = await Promise.all([
        StorageService.getUserProfile(),
        StorageService.getAppSettings()
      ]);

      setProfile(userProfile);
      
      // Show onboarding if not completed
      if (!appSettings.onboardingCompleted && !userProfile) {
        setShowOnboarding(true);
        setCurrentView('onboarding');
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setCurrentView('profile');
    
    // Mark onboarding as complete
    const settings = await StorageService.getAppSettings();
    await StorageService.saveAppSettings({
      ...settings,
      onboardingCompleted: true
    });
  };

  const loadSampleData = async () => {
    try {
      await StorageService.saveUserProfile(sampleProfile);
      setProfile(sampleProfile);
      alert('Sample data loaded successfully!');
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Logo size={48} showText={true} className="justify-center mb-4" />
            <h1 className="text-3xl font-bold text-slate-900">Welcome to RoleReady</h1>
            <p className="text-slate-600 mt-2">Let's set up your profile to start creating tailored resumes</p>
          </div>
          
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo size={32} showText={true} />
            
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentView('profile')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${currentView === 'profile' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }
                `}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => setCurrentView('settings')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${currentView === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }
                `}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                <BookOpen size={18} />
                <span>Tutorial</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {currentView === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Profile Management</h1>
              {!profile && (
                <button
                  onClick={loadSampleData}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Load Sample Data
                </button>
              )}
            </div>
            
            {profile ? (
              <ProfileEditor profile={profile} onProfileChange={setProfile} />
            ) : (
              <div className="text-center py-12">
                <User size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Profile Found</h3>
                <p className="text-slate-500 mb-6">Create your profile to start generating tailored resumes</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Start Setup Wizard
                  </button>
                  <button
                    onClick={loadSampleData}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Load Sample Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                <button
                  onClick={loadSampleData}
                  className="w-full p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="font-semibold">Load Sample Data</div>
                  <div className="text-sm text-slate-600">Populate with example profile and job description</div>
                </button>
                
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="font-semibold">Show Tutorial</div>
                  <div className="text-sm text-slate-600">Run through the onboarding process again</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}