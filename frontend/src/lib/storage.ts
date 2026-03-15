import { UserProfile, JobDescription, TailorSettings, AppSettings } from '../types';

export class StorageService {
  // Sync storage for small settings
  static async getAppSettings(): Promise<AppSettings> {
    const result = await chrome.storage.sync.get('appSettings');
    return result.appSettings || {
      theme: 'system',
      onboardingCompleted: false
    };
  }

  static async saveAppSettings(settings: AppSettings): Promise<void> {
    await chrome.storage.sync.set({ appSettings: settings });
  }

  static async getTailorSettings(): Promise<TailorSettings> {
    const result = await chrome.storage.sync.get('tailorSettings');
    return result.tailorSettings || {
      template: 'clean',
      sections: {
        summary: true,
        skills: true,
        experience: true,
        education: true,
        achievements: true
      },
      bulletDensity: 'normal',
      pageSize: 'a4'
    };
  }

  static async saveTailorSettings(settings: TailorSettings): Promise<void> {
    await chrome.storage.sync.set({ tailorSettings: settings });
  }

  // Local storage for larger data
  static async getUserProfile(): Promise<UserProfile | null> {
    const result = await chrome.storage.local.get('userProfile');
    return result.userProfile || null;
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const updatedProfile = {
      ...profile,
      lastSaved: new Date().toISOString()
    };
    await chrome.storage.local.set({ userProfile: updatedProfile });
  }

  static async getJobDescriptions(): Promise<JobDescription[]> {
    const result = await chrome.storage.local.get('jobDescriptions');
    return result.jobDescriptions || [];
  }

  static async saveJobDescription(jd: JobDescription): Promise<void> {
    const existing = await this.getJobDescriptions();
    const updated = existing.filter(j => j.id !== jd.id);
    updated.unshift(jd);
    // Keep only last 50 job descriptions
    const trimmed = updated.slice(0, 50);
    await chrome.storage.local.set({ jobDescriptions: trimmed });
  }

  static async deleteJobDescription(id: string): Promise<void> {
    const existing = await this.getJobDescriptions();
    const updated = existing.filter(j => j.id !== id);
    await chrome.storage.local.set({ jobDescriptions: updated });
  }

  static async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
    await chrome.storage.sync.clear();
  }

  static async exportData(): Promise<string> {
    const [profile, jobDescriptions, settings, tailorSettings] = await Promise.all([
      this.getUserProfile(),
      this.getJobDescriptions(),
      this.getAppSettings(),
      this.getTailorSettings()
    ]);

    return JSON.stringify({
      profile,
      jobDescriptions,
      settings,
      tailorSettings,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        await this.saveUserProfile(data.profile);
      }
      
      if (data.jobDescriptions) {
        await chrome.storage.local.set({ jobDescriptions: data.jobDescriptions });
      }
      
      if (data.settings) {
        await this.saveAppSettings(data.settings);
      }
      
      if (data.tailorSettings) {
        await this.saveTailorSettings(data.tailorSettings);
      }
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
}