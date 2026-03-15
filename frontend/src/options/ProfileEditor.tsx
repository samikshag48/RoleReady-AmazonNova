import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../lib/storage';
import { ProfileTab } from '../popup/tabs/ProfileTab';
import { useDebouncedSave } from '../hooks/useStorage';

interface ProfileEditorProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

export function ProfileEditor({ profile, onProfileChange }: ProfileEditorProps) {
  const { saving, lastSaved } = useDebouncedSave(
    profile,
    async (updatedProfile) => {
      await StorageService.saveUserProfile(updatedProfile);
      onProfileChange(updatedProfile);
    },
    2000
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Save Status */}
      <div className="border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Profile Editor</h2>
          <div className="flex items-center gap-2 text-sm">
            {saving ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-600">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Profile Tab Content */}
      <div className="p-6">
        <ProfileTab />
      </div>
    </div>
  );
}