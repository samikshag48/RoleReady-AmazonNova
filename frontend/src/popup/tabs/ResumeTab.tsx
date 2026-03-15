import React, { useState, useEffect } from 'react';
import { StorageService } from '../../lib/storage';
import { ApiService } from '../../lib/apiService';
import { ResumeConverter } from '../../lib/resumeConverter';
import { KeywordMatcher } from '../../lib/keywordMatch';
import { UserProfile, JobDescription, TailorSettings, TailoredResume } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ResumePreview } from '../components/ResumePreview';
import { FileText, Download, Target } from 'lucide-react';

export function ResumeTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentJD, setCurrentJD] = useState<JobDescription | null>(null);
  const [tailorSettings, setTailorSettings] = useState<TailorSettings | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [fitScore, setFitScore] = useState<{ score: number; label: string; explanation: string } | null>(null);
  const [isScoringFit, setIsScoringFit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [userProfile, settings, jobDescriptions, appSettings] = await Promise.all([
        StorageService.getUserProfile(),
        StorageService.getTailorSettings(),
        StorageService.getJobDescriptions(),
        StorageService.getAppSettings()
      ]);
      setProfile(userProfile);
      setTailorSettings(settings);
      if (appSettings.lastActiveJobId) {
        const activeJD = jobDescriptions.find(jd => jd.id === appSettings.lastActiveJobId);
        if (activeJD) setCurrentJD(activeJD);
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFitScore = async () => {
    if (!profile || !currentJD) return;
    setIsScoringFit(true);
    try {
      const resumeText = ResumeConverter.profileToResumeText(profile);
      const result = await ApiService.fitScore({
        resume: resumeText,
        job_description: currentJD.rawText
      });
      setFitScore(result);
    } catch (error) {
      console.error('Fit score failed:', error);
    } finally {
      setIsScoringFit(false);
    }
  };

  const generateResume = async () => {
    if (!profile || !currentJD || !tailorSettings) return;
    setIsGenerating(true);
    try {
      const profileAnalysis = KeywordMatcher.analyzeProfile(profile, currentJD);
      setAnalysis(profileAnalysis);
      const resumeText = ResumeConverter.profileToResumeText(profile);
      const response = await ApiService.editResume({
        resume: resumeText,
        job_description: currentJD.rawText
      });
      const resume: TailoredResume = {
        summary: '',
        skills: [],
        experience: [],
        education: [],
        achievements: [],
        keywordCoverage: profileAnalysis.keywordCoverage,
        tailoredFor: { jobTitle: currentJD.title, company: currentJD.company },
        tailored_resume: response.tailored_resume
      };
      setTailoredResume(resume);
    } catch (error) {
      console.error('Failed to generate resume:', error);
      alert('Failed to generate resume. Please ensure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSettings = async (updates: Partial<TailorSettings>) => {
    if (!tailorSettings) return;
    const newSettings = { ...tailorSettings, ...updates };
    setTailorSettings(newSettings);
    await StorageService.saveTailorSettings(newSettings);
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-500';
  };

  const scoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 55) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">No Profile Found</h3>
        <p className="text-slate-500 mb-4">Create your profile first to generate tailored resumes.</p>
      </div>
    );
  }

  if (!currentJD) {
    return (
      <div className="p-6 text-center">
        <Target size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">No Job Description</h3>
        <p className="text-slate-500 mb-4">Scan a job or paste a URL in the Scan tab first.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Resume Builder</h2>
          <div className="flex gap-2">
            <button
              onClick={checkFitScore}
              disabled={isScoringFit}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium
                ${isScoringFit ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
            >
              {isScoringFit ? <><LoadingSpinner size="sm" /> Scoring...</> : '⚡ Fit Score'}
            </button>
            <button
              onClick={generateResume}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium
                ${isGenerating ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isGenerating ? <><LoadingSpinner size="sm" /> Tailoring...</> : <><Target size={16} /> Tailor to JD</>}
            </button>
            {tailoredResume && (
              <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600">
                <Download size={16} /> PDF
              </button>
            )}
          </div>
        </div>

        {/* Current JD */}
        <div className="bg-slate-50 rounded p-3">
          <div className="text-sm font-medium text-slate-800">{currentJD.title}</div>
          <div className="text-sm text-slate-600">{currentJD.company}{currentJD.location ? ` • ${currentJD.location}` : ''}</div>
        </div>

        {/* Nova Fit Score */}
        {fitScore && (
          <div className={`rounded-lg border p-3 space-y-1 ${scoreBg(fitScore.score)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Nova Fit Score</span>
              <span className={`text-2xl font-bold ${scoreColor(fitScore.score)}`}>{fitScore.score}%</span>
            </div>
            <div className={`text-sm font-medium ${scoreColor(fitScore.score)}`}>{fitScore.label}</div>
            <p className="text-xs text-slate-600">{fitScore.explanation}</p>
          </div>
        )}

        {/* Keyword analysis */}
        {analysis && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{Math.round(analysis.overallScore)}%</div>
              <div className="text-xs text-slate-500">Match</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{Math.round(analysis.keywordCoverage)}%</div>
              <div className="text-xs text-slate-500">Keywords</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{analysis.skillMatches.filter((m: any) => m.score > 0).length}</div>
              <div className="text-xs text-slate-500">Skills</div>
            </div>
          </div>
        )}

        {/* Template settings */}
        {tailorSettings && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Template:</label>
              <select value={tailorSettings.template} onChange={(e) => updateSettings({ template: e.target.value as any })} className="text-sm border border-slate-300 rounded px-2 py-1">
                <option value="clean">Clean</option>
                <option value="split">Split</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Density:</label>
              <select value={tailorSettings.bulletDensity} onChange={(e) => updateSettings({ bulletDensity: e.target.value as any })} className="text-sm border border-slate-300 rounded px-2 py-1">
                <option value="short">Short</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        {tailoredResume && tailorSettings ? (
          <ResumePreview resume={tailoredResume} template={tailorSettings.template} settings={tailorSettings} />
        ) : (
          <div className="text-center text-slate-500 py-12">
            <FileText size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-sm">Click "⚡ Fit Score" to check your match, then "Tailor to JD" to generate your resume.</p>
          </div>
        )}
      </div>
    </div>
  );
}
