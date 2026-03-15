import React, { useState, useEffect } from 'react';
import { StorageService } from '../../lib/storage';
import { sampleProfile, sampleJobDescription } from '../../lib/sampleData';
import { AppSettings } from '../../types';
import { Download, Upload, Trash2, Database, Moon, Sun, Monitor } from 'lucide-react';

export function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const appSettings = await StorageService.getAppSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await StorageService.saveAppSettings(newSettings);
  };

  const loadSampleData = async () => {
    try {
      await StorageService.saveUserProfile(sampleProfile);
      await StorageService.saveJobDescription(sampleJobDescription);
      
      alert('Sample data loaded successfully!');
    } catch (error) {
      console.error('Failed to load sample data:', error);
      alert('Failed to load sample data');
    }
  };

  const exportAllData = async () => {
    try {
      const data = await StorageService.exportData();
      setExportData(data);
      setShowExport(true);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await StorageService.importData(text);
      alert('Data imported successfully!');
      window.location.reload(); // Refresh to show imported data
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await StorageService.clearAllData();
      alert('All data cleared successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      alert('Data copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!settings) {
    return <div className="p-4">Loading settings...</div>;
  }

  if (showExport) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Export Data</h3>
          <button
            onClick={() => setShowExport(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        
        <textarea
          readOnly
          value={exportData}
          className="w-full h-64 p-3 border border-slate-300 rounded text-xs font-mono"
        />
        
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={() => {
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'roleready-data.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Download File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Settings</h2>

      {/* Theme Settings */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-slate-700">Appearance</h3>
        <div className="space-y-2">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <label key={value} className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="theme"
                value={value}
                checked={settings.theme === value}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="text-blue-500"
              />
              <Icon size={18} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-slate-700">Data Management</h3>
        
        <div className="space-y-2">
          <button
            onClick={loadSampleData}
            className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded text-left hover:bg-slate-50"
          >
            <Database size={18} />
            <div>
              <div className="font-medium">Load Sample Data</div>
              <div className="text-xs text-slate-500">Populate with example profile and job description</div>
            </div>
          </button>

          <button
            onClick={exportAllData}
            className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded text-left hover:bg-slate-50"
          >
            <Download size={18} />
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-xs text-slate-500">Download all your data as JSON</div>
            </div>
          </button>

          <label className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded text-left hover:bg-slate-50 cursor-pointer">
            <Upload size={18} />
            <div>
              <div className="font-medium">Import Data</div>
              <div className="text-xs text-slate-500">Upload a previously exported JSON file</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            onClick={clearAllData}
            disabled={isClearing}
            className="w-full flex items-center gap-3 p-3 border border-red-200 rounded text-left hover:bg-red-50 text-red-600 disabled:opacity-50"
          >
            <Trash2 size={18} />
            <div>
              <div className="font-medium">
                {isClearing ? 'Clearing...' : 'Clear All Data'}
              </div>
              <div className="text-xs text-red-500">Remove all profiles and job descriptions</div>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-slate-700">Privacy</h3>
        <div className="p-3 bg-slate-50 rounded text-sm text-slate-600">
          <p className="mb-2">🔒 Your privacy is important to us:</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>All data is stored locally in your browser</li>
            <li>No data is sent to external servers</li>
            <li>Job descriptions are processed locally</li>
            <li>Resume generation happens on your device</li>
          </ul>
        </div>
      </div>

      {/* Version Info */}
      <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
        <div>RoleReady v1.0.0</div>
        <div>Built with privacy-first design</div>
      </div>
    </div>
  );
}