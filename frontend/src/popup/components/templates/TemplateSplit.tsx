import React from 'react';
import { TailoredResume, TailorSettings } from '../../../types';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

interface TemplateSplitProps {
  resume: TailoredResume;
  settings: TailorSettings;
}

export function TemplateSplit({ resume, settings }: TemplateSplitProps) {
  return (
    <div className="font-inter text-slate-800 grid grid-cols-3 gap-6 min-h-[11in]">
      {/* Left Sidebar */}
      <div className="col-span-1 bg-slate-50 p-6 rounded-l-lg">
        {/* Contact Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">John Doe</h1>
          <p className="text-blue-600 font-medium text-lg mb-4">Senior Software Engineer</p>
          
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-500" />
              <span>john@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-500" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-500" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin size={14} className="text-blue-500" />
              <span className="text-blue-600">linkedin.com/in/johndoe</span>
            </div>
            <div className="flex items-center gap-2">
              <Github size={14} className="text-slate-500" />
              <span>github.com/johndoe</span>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        {settings.sections.skills && resume.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-300 pb-1">
              Technical Skills
            </h2>
            <div className="space-y-2">
              {resume.skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium text-center"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {settings.sections.education && resume.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-300 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {resume.education.map((edu, index) => (
                <div key={index} className="text-sm">
                  <h3 className="font-semibold text-slate-900 leading-tight">{edu.degree}</h3>
                  <p className="text-blue-600 text-xs">{edu.school}</p>
                  <p className="text-slate-600 text-xs">{edu.duration}</p>
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {edu.highlights.map((highlight, hIndex) => (
                        <li key={hIndex} className="text-xs text-slate-600 flex items-start">
                          <span className="text-blue-600 mr-1 mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {settings.sections.achievements && resume.achievements.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-300 pb-1">
              Certifications
            </h2>
            <div className="space-y-2">
              {resume.achievements.map((achievement, index) => (
                <div key={index} className="text-sm">
                  <h3 className="font-semibold text-slate-900 text-xs leading-tight">
                    {achievement.title}
                  </h3>
                  {achievement.date && (
                    <p className="text-slate-600 text-xs">
                      {new Date(achievement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="col-span-2 p-6">
        {/* Professional Summary */}
        {settings.sections.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3 border-b-2 border-blue-600 pb-1">
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm">{resume.summary}</p>
          </div>
        )}

        {/* Professional Experience */}
        {settings.sections.experience && resume.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b-2 border-blue-600 pb-1">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {resume.experience.map((exp, index) => (
                <div key={index}>
                  <div className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                        <p className="text-blue-600 font-semibold">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-slate-600 font-medium">
                        <div>{exp.duration}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  {exp.achievements.length > 0 && (
                    <ul className="space-y-2 mb-3">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start text-sm">
                          <span className="text-blue-600 mr-3 mt-1.5 text-xs font-bold">▸</span>
                          <span 
                            className="text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: achievement }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technologies */}
                  {exp.technologies.length > 0 && (
                    <div className="text-sm">
                      <span className="font-semibold text-slate-800">Key Technologies: </span>
                      <span className="text-slate-600">{exp.technologies.join(' • ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}