import React from 'react';
import { TailoredResume, TailorSettings } from '../../../types';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

interface TemplateElegantProps {
  resume: TailoredResume;
  settings: TailorSettings;
}

export function TemplateElegant({ resume, settings }: TemplateElegantProps) {
  return (
    <div className="font-georgia text-slate-800 leading-relaxed max-w-4xl mx-auto">
      {/* Elegant Header with Subtle Background */}
      <div className="text-center bg-gradient-to-r from-slate-50 to-blue-50 p-8 rounded-t-lg border-b-4 border-blue-600">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-wide">John Doe</h1>
        <p className="text-xl text-slate-600 mb-4 italic">Senior Software Engineer</p>
        
        <div className="flex justify-center items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-600" />
            <span>john@example.com</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-blue-600" />
            <span>(555) 123-4567</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            <span>San Francisco, CA</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <Linkedin size={16} />
            <span>linkedin.com/in/johndoe</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Github size={16} />
            <span>github.com/johndoe</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Professional Summary with Elegant Typography */}
        {settings.sections.summary && (
          <div className="mb-8 mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center relative">
              <span className="bg-white px-4">Professional Summary</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
            </h2>
            <p className="text-slate-700 leading-relaxed text-center max-w-4xl mx-auto text-lg italic">
              {resume.summary}
            </p>
          </div>
        )}

        {/* Core Competencies in Elegant Grid */}
        {settings.sections.skills && resume.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center relative">
              <span className="bg-white px-4">Core Competencies</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
            </h2>
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {resume.skills.map((skill, index) => (
                <div
                  key={index}
                  className="text-center py-2 px-3 border border-blue-200 rounded-lg bg-blue-50/50 text-slate-800 font-medium"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Experience with Timeline Feel */}
        {settings.sections.experience && resume.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center relative">
              <span className="bg-white px-4">Professional Experience</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
            </h2>
            
            <div className="space-y-8 relative">
              {/* Subtle Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-blue-200"></div>
              
              {resume.experience.map((exp, index) => (
                <div key={index} className="relative pl-16">
                  {/* Timeline Dot */}
                  <div className="absolute left-6 top-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{exp.role}</h3>
                        <p className="text-blue-600 font-semibold text-lg">{exp.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600 font-medium">
                          {exp.duration}
                        </div>
                      </div>
                    </div>
                    
                    {/* Achievements */}
                    {exp.achievements.length > 0 && (
                      <ul className="space-y-2 mb-4">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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
                      <div className="border-t border-slate-100 pt-3">
                        <span className="font-semibold text-slate-800 text-sm">Technologies: </span>
                        <div className="inline-flex flex-wrap gap-2 mt-1">
                          {exp.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Achievements Side by Side */}
        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {settings.sections.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 text-center relative">
                <span className="bg-white px-3">Education</span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
              </h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index} className="text-center border border-slate-200 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-1">{edu.degree}</h3>
                    <p className="text-blue-600 font-semibold">{edu.school}</p>
                    <p className="text-slate-600 text-sm">{edu.duration}</p>
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {edu.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="text-slate-700">
                            • {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {settings.sections.achievements && resume.achievements.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 text-center relative">
                <span className="bg-white px-3">Certifications</span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
              </h2>
              <div className="space-y-4">
                {resume.achievements.map((achievement, index) => (
                  <div key={index} className="text-center border border-slate-200 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-1">{achievement.title}</h3>
                    <p className="text-slate-700 text-sm mb-2">{achievement.description}</p>
                    {achievement.date && (
                      <p className="text-slate-600 text-sm">
                        {new Date(achievement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    )}
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