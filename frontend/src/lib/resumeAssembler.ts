import { UserProfile, JobDescription, TailorSettings } from '../types';
import { KeywordMatcher } from './keywordMatch';

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    duration: string;
    highlights?: string[];
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date?: string;
  }>;
  keywordCoverage: number;
  tailoredFor: {
    jobTitle: string;
    company: string;
  };
}

export class ResumeAssembler {
  static tailorResume(
    profile: UserProfile,
    jobDescription: JobDescription,
    settings: TailorSettings
  ): TailoredResume {
    const analysis = KeywordMatcher.analyzeProfile(profile, jobDescription);

    // Generate tailored summary
    const summary = this.generateSummary(profile, jobDescription, analysis);

    // Select and rank skills
    const skills = this.selectSkills(profile, analysis, 12);

    // Select and rank experience
    const experience = this.selectExperience(profile, analysis, settings);

    // Format education
    const education = this.formatEducation(profile);

    // Select achievements
    const achievements = this.selectAchievements(profile, analysis, 2);

    return {
      summary,
      skills,
      experience,
      education,
      achievements,
      keywordCoverage: analysis.keywordCoverage,
      tailoredFor: {
        jobTitle: jobDescription.title,
        company: jobDescription.company
      }
    };
  }

  private static generateSummary(
    profile: UserProfile,
    jobDescription: JobDescription,
    analysis: any
  ): string {
    const { basics, experience } = profile;
    const yearsExp = this.calculateYearsOfExperience(experience);
    const topSkills = analysis.skillMatches
      .slice(0, 3)
      .map((m: any) => m.skill.name)
      .join(', ');

    const seniority = jobDescription.seniority || this.inferSeniority(yearsExp);
    
    return `${seniority} ${basics.title} with ${yearsExp}+ years of experience in ${topSkills}. ` +
           `Proven track record of delivering scalable solutions and leading cross-functional teams. ` +
           `Seeking to leverage expertise in ${topSkills} to drive innovation at ${jobDescription.company}.`;
  }

  private static selectSkills(profile: UserProfile, analysis: any, limit: number): string[] {
    // Prioritize matched skills with high proficiency
    const rankedSkills = analysis.skillMatches
      .filter((match: any) => match.score > 0)
      .slice(0, limit)
      .map((match: any) => match.skill.name);

    // Fill remaining slots with high-proficiency unmatched skills
    const unmatched = profile.skills
      .filter(skill => !rankedSkills.includes(skill.name) && skill.proficiency >= 4)
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, limit - rankedSkills.length)
      .map(skill => skill.name);

    return [...rankedSkills, ...unmatched].slice(0, limit);
  }

  private static selectExperience(
    profile: UserProfile,
    analysis: any,
    settings: TailorSettings
  ): TailoredResume['experience'] {
    // Select top 2 most relevant experiences
    const topExperiences = analysis.experienceMatches.slice(0, 2);

    return topExperiences.map((match: any) => {
      const exp = match.experience;
      const achievements = this.rankAchievements(exp.achievements, match.matched, settings);
      
      return {
        company: exp.company,
        role: exp.role,
        duration: this.formatDateRange(exp.startDate, exp.endDate),
        achievements: achievements.slice(0, settings.bulletDensity === 'short' ? 3 : 5),
        technologies: exp.technologies.slice(0, 8)
      };
    });
  }

  private static rankAchievements(achievements: string[], matchedKeywords: string[], settings: TailorSettings): string[] {
    // Score achievements by keyword matches and impact metrics
    const scored = achievements.map(achievement => {
      let score = 0;
      
      // Keyword matches
      matchedKeywords.forEach(keyword => {
        if (achievement.toLowerCase().includes(keyword.toLowerCase())) {
          score += 3;
        }
      });

      // Impact metrics (numbers, percentages, improvements)
      const hasMetrics = /\d+(\.\d+)?[%$KMBkmb]?|\d+\+|improve[d]?|increase[d]?|reduce[d]?|boost[ed]?|optimize[d]?/i.test(achievement);
      if (hasMetrics) score += 2;

      // Action verbs
      const actionVerbs = ['led', 'developed', 'implemented', 'created', 'designed', 'built', 'managed', 'optimized'];
      const hasActionVerb = actionVerbs.some(verb => 
        achievement.toLowerCase().startsWith(verb)
      );
      if (hasActionVerb) score += 1;

      return { achievement, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => this.enhanceAchievement(item.achievement));
  }

  private static enhanceAchievement(achievement: string): string {
    // Bold numbers and percentages for visual emphasis
    return achievement.replace(
      /(\d+(?:\.\d+)?[%$KMBkmb]?|\d+\+)/g,
      '<strong>$1</strong>'
    );
  }

  private static formatEducation(profile: UserProfile): TailoredResume['education'] {
    return profile.education.map(edu => ({
      degree: edu.degree,
      school: edu.school,
      duration: this.formatDateRange(edu.startDate, edu.endDate),
      highlights: edu.highlights?.slice(0, 2)
    }));
  }

  private static selectAchievements(
    profile: UserProfile,
    analysis: any,
    limit: number
  ): TailoredResume['achievements'] {
    // Prioritize recent certifications and awards
    const sorted = profile.achievements
      .filter(achievement => 
        achievement.category === 'certification' || 
        achievement.category === 'award'
      )
      .sort((a, b) => {
        const dateA = new Date(a.date || '2000-01-01');
        const dateB = new Date(b.date || '2000-01-01');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);

    return sorted.map(achievement => ({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date
    }));
  }

  private static calculateYearsOfExperience(experience: any[]): number {
    const totalMonths = experience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);

    return Math.round(totalMonths / 12);
  }

  private static inferSeniority(years: number): string {
    if (years >= 8) return 'Senior';
    if (years >= 5) return 'Mid-Level';
    if (years >= 2) return 'Junior';
    return 'Entry-Level';
  }

  private static formatDateRange(start: string, end?: string): string {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    const formatMonth = (date: Date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${month} ${year}`;
    };

    const startFormatted = formatMonth(startDate);
    const endFormatted = endDate ? formatMonth(endDate) : 'Present';
    
    return `${startFormatted} - ${endFormatted}`;
  }
}