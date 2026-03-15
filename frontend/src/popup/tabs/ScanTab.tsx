import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../hooks/useMessaging';
import { StorageService } from '../../lib/storage';
import { ApiService } from '../../lib/apiService';
import { JobDescription } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Scan, MapPin, Building, Calendar, Edit3, Link } from 'lucide-react';

export function ScanTab() {
  const [isScanning, setIsScanning] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentJD, setCurrentJD] = useState<JobDescription | null>(null);
  const [recentJDs, setRecentJDs] = useState<JobDescription[]>([]);
  const [editingJD, setEditingJD] = useState<JobDescription | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [extractError, setExtractError] = useState('');
  const { scanCurrentPage, lastMessage } = useMessaging();

  useEffect(() => { loadRecentJDs(); }, []);

  useEffect(() => {
    if (lastMessage?.type === 'JD_SCANNED') {
      setCurrentJD(lastMessage.payload);
      setIsScanning(false);
      loadRecentJDs();
    }
  }, [lastMessage]);

  const loadRecentJDs = async () => {
    try {
      const jds = await StorageService.getJobDescriptions();
      setRecentJDs(jds.slice(0, 5));
      const settings = await StorageService.getAppSettings();
      if (settings.lastActiveJobId) {
        const activeJD = jds.find(jd => jd.id === settings.lastActiveJobId);
        if (activeJD) setCurrentJD(activeJD);
      }
    } catch (error) {
      console.error('Failed to load recent job descriptions:', error);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanCurrentPage();
    } catch (error) {
      console.error('Scan failed:', error);
      setIsScanning(false);
    }
  };

  const handleExtractFromUrl = async () => {
    if (!urlInput.trim()) return;
    setIsExtracting(true);
    setExtractError('');
    try {
      const result = await ApiService.extractJob({ url: urlInput.trim() });
      const newJD: JobDescription = {
        id: Date.now().toString(),
        title: 'Job from URL',
        company: '',
        location: '',
        seniority: '',
        skills: [],
        rawText: result.job_description,
        scrapedAt: new Date().toISOString(),
        url: urlInput.trim(),
      };
      await StorageService.saveJobDescription(newJD);
      setCurrentJD(newJD);
      setUrlInput('');
      loadRecentJDs();
    } catch (error: any) {
      console.error('EXTRACT FULL ERROR:', error);
      setExtractError(error.message || 'Failed to extract job description');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEdit = (jd: JobDescription) => setEditingJD({ ...jd });

  const handleSaveEdit = async () => {
    if (!editingJD) return;
    try {
      await StorageService.saveJobDescription(editingJD);
      setCurrentJD(editingJD);
      setEditingJD(null);
      loadRecentJDs();
    } catch (error) {
      console.error('Failed to save job description:', error);
    }
  };

  const handleSelectRecent = async (jd: JobDescription) => {
    setCurrentJD(jd);
    const settings = await StorageService.getAppSettings();
    await StorageService.saveAppSettings({ ...settings, lastActiveJobId: jd.id });
  };

  if (editingJD) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Job Description</h2>
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Save</button>
            <button onClick={() => setEditingJD(null)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">Cancel</button>
          </div>
        </div>
        <div className="space-y-3">
          <input type="text" value={editingJD.title} onChange={(e) => setEditingJD({ ...editingJD, title: e.target.value })} className="w-full p-2 border rounded" placeholder="Job Title" />
          <input type="text" value={editingJD.company} onChange={(e) => setEditingJD({ ...editingJD, company: e.target.value })} className="w-full p-2 border rounded" placeholder="Company" />
          <input type="text" value={editingJD.location} onChange={(e) => setEditingJD({ ...editingJD, location: e.target.value })} className="w-full p-2 border rounded" placeholder="Location" />
          <textarea value={editingJD.rawText} onChange={(e) => setEditingJD({ ...editingJD, rawText: e.target.value })} className="w-full p-2 border rounded h-32" placeholder="Job description text..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Scan current page */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Scan Job Description</h2>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all
            ${isScanning ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-600'}`}
        >
          {isScanning ? <><LoadingSpinner size="sm" /><span>Scanning...</span></> : <><Scan size={18} /><span>Scan Current Page</span></>}
        </button>

        {/* URL paste input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtractFromUrl()}
              placeholder="Or paste a job URL..."
              className="flex-1 p-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleExtractFromUrl}
              disabled={isExtracting || !urlInput.trim()}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors
                ${isExtracting || !urlInput.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isExtracting ? <LoadingSpinner size="sm" /> : <Link size={14} />}
              {isExtracting ? 'Extracting...' : 'Extract'}
            </button>
          </div>
          {extractError && <p className="text-xs text-red-500">{extractError}</p>}
        </div>
      </div>

      {/* Current JD */}
      {currentJD && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-slate-800">Current Job</h3>
            <button onClick={() => handleEdit(currentJD)} className="p-1 text-slate-500 hover:text-slate-700 rounded">
              <Edit3 size={16} />
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800">{currentJD.title}</h4>
              <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                {currentJD.company && <div className="flex items-center gap-1"><Building size={14} /><span>{currentJD.company}</span></div>}
                {currentJD.location && <div className="flex items-center gap-1"><MapPin size={14} /><span>{currentJD.location}</span></div>}
              </div>
            </div>
            {currentJD.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentJD.skills.slice(0, 8).map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{skill}</span>
                ))}
                {currentJD.skills.length > 8 && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">+{currentJD.skills.length - 8} more</span>}
              </div>
            )}
            <div className="text-xs text-slate-400">Scanned {new Date(currentJD.scrapedAt).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Recent JDs */}
      {recentJDs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-md font-medium text-slate-800">Recent Scans</h3>
          {recentJDs.map((jd) => (
            <button key={jd.id} onClick={() => handleSelectRecent(jd)}
              className={`w-full text-left p-3 rounded border transition-colors
                ${currentJD?.id === jd.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <div className="font-medium text-sm text-slate-800 truncate">{jd.title}</div>
              <div className="text-xs text-slate-500 truncate">{jd.company} • {new Date(jd.scrapedAt).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      )}

      {!currentJD && recentJDs.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          <p className="text-sm">Scan the current page or paste a job URL above.</p>
        </div>
      )}
    </div>
  );
}
