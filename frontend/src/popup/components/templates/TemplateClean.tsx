import React from 'react';
import { TailoredResume, TailorSettings } from '../../../types';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';

interface TemplateCleanProps {
  resume: TailoredResume;
  settings: TailorSettings;
}

export function TemplateClean({ resume, settings }: TemplateCleanProps) {
  return (
    <div className="font-inter text-slate-800 leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">John Doe</h1>
        <p className="text-lg text-slate-600 mb-3">Senior Software Engineer</p>
        <div className="flex justify-center items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Mail size={14} />
            <span>john@example.com</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={14} />
            <span>(555) 123-4567</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>San Francisco, CA</span>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1 text-blue-600">
            <Linkedin size={14} />
            <span>linkedin.com/in/johndoe</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <Github size={14} />
            <span>github.com/johndoe</span>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {settings.sections.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Technical Skills */}
      {settings.sections.skills && resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {settings.sections.experience && resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-5">
            {resume.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{exp.role}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div>{exp.duration}</div>
                  </div>
                </div>
                
                {/* Achievements */}
                {exp.achievements.length > 0 && (
                  <ul className="space-y-1 mb-3 text-slate-700">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1.5 text-xs">●</span>
                        <span 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: achievement }}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {exp.technologies.length > 0 && (
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Technologies: </span>
                    <span>{exp.technologies.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {settings.sections.education && resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                    <p className="text-blue-600">{edu.school}</p>
                  </div>
                  <div className="text-sm text-slate-600">{edu.duration}</div>
                </div>
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="mt-1 text-sm text-slate-700">
                    {edu.highlights.map((highlight, hIndex) => (
                      <li key={hIndex} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1.5 text-xs">●</span>
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

      {/* Achievements & Certifications */}
      {settings.sections.achievements && resume.achievements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Certifications & Awards
          </h2>
          <div className="space-y-2">
            {resume.achievements.map((achievement, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                  <p className="text-sm text-slate-700">{achievement.description}</p>
                </div>
                {achievement.date && (
                  <div className="text-sm text-slate-600">
                    {new Date(achievement.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}