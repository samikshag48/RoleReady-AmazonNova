import { UserProfile, JobDescription, Skill, ExperienceItem } from '../types';

export interface MatchResult {
  score: number;
  matchedKeywords: string[];
  coverage: number; // percentage of JD keywords matched
}

export class KeywordMatcher {
  static analyzeProfile(profile: UserProfile, jobDescription: JobDescription): {
    overallScore: number;
    skillMatches: Array<{ skill: Skill; score: number; matched: string[] }>;
    experienceMatches: Array<{ experience: ExperienceItem; score: number; matched: string[] }>;
    keywordCoverage: number;
    suggestions: string[];
  } {
    const jdKeywords = this.extractKeywords(jobDescription);
    const profileKeywords = this.extractProfileKeywords(profile);

    // Score skills
    const skillMatches = profile.skills.map(skill => {
      const matched = this.findMatches([skill.name, ...this.getSkillAliases(skill.name)], jdKeywords);
      const score = matched.length > 0 ? skill.proficiency * matched.length : 0;
      return { skill, score, matched };
    }).sort((a, b) => b.score - a.score);

    // Score experience
    const experienceMatches = profile.experience.map(exp => {
      const expKeywords = [...exp.technologies, ...this.extractTextKeywords(exp.achievements.join(' '))];
      const matched = this.findMatches(expKeywords, jdKeywords);
      const score = matched.length * 2 + (exp.endDate ? 0 : 1); // Bonus for current role
      return { experience: exp, score, matched };
    }).sort((a, b) => b.score - a.score);

    // Calculate overall metrics
    const totalMatched = new Set([
      ...skillMatches.flatMap(m => m.matched),
      ...experienceMatches.flatMap(m => m.matched)
    ]);

    const keywordCoverage = jdKeywords.length > 0 ? (totalMatched.size / jdKeywords.length) * 100 : 0;
    const overallScore = Math.min(100, keywordCoverage + (skillMatches.length > 0 ? 10 : 0));

    // Generate suggestions
    const unmatched = jdKeywords.filter(keyword => !totalMatched.has(keyword.toLowerCase()));
    const suggestions = unmatched.slice(0, 5);

    return {
      overallScore,
      skillMatches,
      experienceMatches,
      keywordCoverage,
      suggestions
    };
  }

  private static extractKeywords(jd: JobDescription): string[] {
    const allText = [
      ...jd.skills,
      ...jd.requirements,
      ...jd.responsibilities,
      ...jd.niceToHave,
      jd.title
    ].join(' ').toLowerCase();

    return this.extractTextKeywords(allText);
  }

  private static extractProfileKeywords(profile: UserProfile): string[] {
    const allText = [
      profile.basics.title,
      ...profile.skills.map(s => s.name),
      ...profile.experience.flatMap(exp => [...exp.technologies, ...exp.achievements]),
      ...profile.education.flatMap(edu => edu.highlights || [])
    ].join(' ').toLowerCase();

    return this.extractTextKeywords(allText);
  }

  private static extractTextKeywords(text: string): string[] {
    // Common technical terms, skills, and action words
    const technicalTerms = [
      'react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'node.js',
      'aws', 'azure', 'docker', 'kubernetes', 'postgresql', 'mongodb', 'graphql',
      'leadership', 'management', 'agile', 'scrum', 'ci/cd', 'devops', 'microservices'
    ];

    const words = text.toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Extract technical terms and compound terms
    const keywords = new Set<string>();
    
    technicalTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.add(term);
      }
    });

    // Add significant words (3+ chars, not common words)
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'may', 'she', 'use', 'your', 'work', 'will'];
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.includes(word)) {
        keywords.add(word);
      }
    });

    return Array.from(keywords);
  }

  private static findMatches(haystack: string[], needles: string[]): string[] {
    const matches: string[] = [];
    const needleLower = needles.map(n => n.toLowerCase());
    
    haystack.forEach(item => {
      const itemLower = item.toLowerCase();
      if (needleLower.some(needle => 
        itemLower.includes(needle) || needle.includes(itemLower)
      )) {
        matches.push(item);
      }
    });

    return matches;
  }

  private static getSkillAliases(skill: string): string[] {
    const aliases: Record<string, string[]> = {
      'react': ['reactjs', 'react.js'],
      'node.js': ['nodejs', 'node'],
      'javascript': ['js', 'es6', 'es2020'],
      'typescript': ['ts'],
      'postgresql': ['postgres', 'psql'],
      'mongodb': ['mongo'],
      'amazon web services': ['aws'],
      'google cloud platform': ['gcp'],
      'kubernetes': ['k8s'],
      'docker': ['containerization'],
    };

    return aliases[skill.toLowerCase()] || [];
  }
}