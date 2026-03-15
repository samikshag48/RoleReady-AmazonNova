import React from 'react';
import { TailoredResume, TailorSettings } from '../../types';
import { TemplateClean } from './templates/TemplateClean';
import { TemplateSplit } from './templates/TemplateSplit';
import { TemplateElegant } from './templates/TemplateElegant';

interface ResumePreviewProps {
  resume: TailoredResume;
  template: TailorSettings['template'];
  settings: TailorSettings;
}

export function ResumePreview({ resume, template, settings }: ResumePreviewProps) {
  // If we have a backend-generated resume, display it as formatted text
  if (resume.tailored_resume) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Print Styles */}
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .resume-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0.5in !important;
              box-shadow: none !important;
              border: none !important;
            }
            .page-break { page-break-before: always; }
            * { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
          
          @media screen {
            .resume-container {
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border: 1px solid #e5e7eb;
            }
          }
        `}</style>

        <div className="resume-container p-8 rounded-lg">
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {resume.tailored_resume}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to template-based rendering
  const TemplateComponent = {
    clean: TemplateClean,
    split: TemplateSplit,
    elegant: TemplateElegant
  }[template];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .resume-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.5in !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break { page-break-before: always; }
          * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
        
        @media screen {
          .resume-container {
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>

      <div className="resume-container p-8 rounded-lg">
        <TemplateComponent resume={resume} settings={settings} />
      </div>

      {/* Tailoring Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm no-print">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-blue-800">
            Tailored for: {resume.tailoredFor.jobTitle} @ {resume.tailoredFor.company}
          </span>
          <span className="text-blue-600">
            {Math.round(resume.keywordCoverage)}% keyword coverage
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${resume.keywordCoverage}%` }}
          />
        </div>
      </div>
    </div>
  );
}