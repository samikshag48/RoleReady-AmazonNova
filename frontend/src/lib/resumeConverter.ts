import { UserProfile } from '../types';

export class ResumeConverter {
  static profileToResumeText(profile: UserProfile): string {
    const { basics, skills, experience, education, achievements } = profile;
    
    let resumeText = '';
    
    // Header
    resumeText += `${basics.name}\n`;
    resumeText += `${basics.title}\n`;
    resumeText += `Email: ${basics.email} | Phone: ${basics.phone}\n`;
    resumeText += `Location: ${basics.location}\n`;
    
    // Links
    const links = Object.entries(basics.links)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(' | ');
    if (links) {
      resumeText += `${links}\n`;
    }
    
    resumeText += '\n';
    
    // Skills
    if (skills.length > 0) {
      resumeText += 'SKILLS\n';
      const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.name);
        return acc;
      }, {} as Record<string, string[]>);
      
      Object.entries(skillsByCategory).forEach(([category, skillNames]) => {
        resumeText += `${category}: ${skillNames.join(', ')}\n`;
      });
      resumeText += '\n';
    }
    
    // Experience
    if (experience.length > 0) {
      resumeText += 'EXPERIENCE\n';
      experience.forEach(exp => {
        const endDate = exp.endDate || 'Present';
        resumeText += `${exp.role} | ${exp.company}`;
        if (exp.location) resumeText += ` | ${exp.location}`;
        resumeText += `\n${exp.startDate} - ${endDate}\n`;
        
        if (exp.achievements.length > 0) {
          exp.achievements.forEach(achievement => {
            resumeText += `• ${achievement}\n`;
          });
        }
        
        if (exp.technologies.length > 0) {
          resumeText += `Technologies: ${exp.technologies.join(', ')}\n`;
        }
        resumeText += '\n';
      });
    }
    
    // Education
    if (education.length > 0) {
      resumeText += 'EDUCATION\n';
      education.forEach(edu => {
        const endDate = edu.endDate || 'Present';
        resumeText += `${edu.degree} | ${edu.school}\n`;
        resumeText += `${edu.startDate} - ${endDate}\n`;
        
        if (edu.gpa) {
          resumeText += `GPA: ${edu.gpa}\n`;
        }
        
        if (edu.highlights && edu.highlights.length > 0) {
          edu.highlights.forEach(highlight => {
            resumeText += `• ${highlight}\n`;
          });
        }
        resumeText += '\n';
      });
    }
    
    // Achievements
    if (achievements.length > 0) {
      resumeText += 'ACHIEVEMENTS & CERTIFICATIONS\n';
      achievements.forEach(achievement => {
        resumeText += `${achievement.title}`;
        if (achievement.date) resumeText += ` (${achievement.date})`;
        resumeText += `\n${achievement.description}\n\n`;
      });
    }
    
    return resumeText.trim();
  }
} 