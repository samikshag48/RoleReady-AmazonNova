import { JobDescription } from '../types';

export class JDParser {
  static parseLinkedIn(document: Document): Partial<JobDescription> {
    const selectors = {
      title: [
        '.top-card-layout__title',
        '.topcard__title',
        'h1[data-test="job-title"]',
        '.jobs-unified-top-card__job-title'
      ],
      company: [
        '.topcard__flavor--bullet',
        '.top-card-layout__second-subline a',
        'a[data-test="job-company-name"]',
        '.jobs-unified-top-card__company-name'
      ],
      location: [
        '.topcard__flavor--bullet:last-child',
        '.top-card-layout__second-subline .topcard__flavor--bullet',
        '[data-test="job-location"]',
        '.jobs-unified-top-card__bullet'
      ],
      description: [
        '.jobs-description__content',
        '.jobs-box__content',
        '[data-test="job-description"]',
        '.jobs-description-content__text'
      ]
    };

    const getTextBySelectorList = (selectorList: string[]): string => {
      for (const selector of selectorList) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return '';
    };

    const title = getTextBySelectorList(selectors.title);
    const company = getTextBySelectorList(selectors.company);
    const location = getTextBySelectorList(selectors.location);
    const description = getTextBySelectorList(selectors.description);

    return {
      title,
      company,
      location,
      rawText: description,
      source: 'linkedin' as const
    };
  }

  static parseGeneric(document: Document): Partial<JobDescription> {
    // Common selectors for job sites
    const titleSelectors = [
      'h1',
      '[data-testid*="job-title"]',
      '.job-title',
      '.position-title',
      '[class*="job-title"]'
    ];

    const companySelectors = [
      '[data-testid*="company"]',
      '.company-name',
      '.employer-name',
      '[class*="company"]'
    ];

    const locationSelectors = [
      '[data-testid*="location"]',
      '.job-location',
      '.location',
      '[class*="location"]'
    ];

    const descriptionSelectors = [
      '[data-testid*="description"]',
      '.job-description',
      '.job-content',
      '[class*="description"]',
      '[class*="content"]'
    ];

    const getFirstValidText = (selectors: string[]): string => {
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text && text.length > 2) {
            return text;
          }
        }
      }
      return '';
    };

    // Find the largest text block as fallback for description
    const findLargestTextBlock = (): string => {
      const textBlocks = Array.from(document.querySelectorAll('div, section, article'))
        .map(el => ({
          element: el,
          text: el.textContent?.trim() || '',
          wordCount: (el.textContent?.trim().split(/\s+/) || []).length
        }))
        .filter(block => 
          block.wordCount > 50 && 
          block.wordCount < 2000 &&
          (block.text.toLowerCase().includes('responsibilities') ||
           block.text.toLowerCase().includes('requirements') ||
           block.text.toLowerCase().includes('qualifications'))
        )
        .sort((a, b) => b.wordCount - a.wordCount);

      return textBlocks[0]?.text || '';
    };

    const title = getFirstValidText(titleSelectors);
    const company = getFirstValidText(companySelectors);
    const location = getFirstValidText(locationSelectors);
    const description = getFirstValidText(descriptionSelectors) || findLargestTextBlock();

    return {
      title,
      company,
      location,
      rawText: description,
      source: 'generic' as const
    };
  }

  static extractStructuredInfo(rawText: string): {
    skills: string[];
    responsibilities: string[];
    requirements: string[];
    niceToHave: string[];
    seniority?: string;
  } {
    if (!rawText) {
      return { skills: [], responsibilities: [], requirements: [], niceToHave: [] };
    }

    const text = rawText.toLowerCase();

    // Extract skills - common tech terms
    const skillKeywords = [
      'react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'node.js',
      'express', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest', 'git', 'jenkins',
      'terraform', 'ansible', 'nginx', 'apache', 'linux', 'windows', 'macos', 'html',
      'css', 'sass', 'webpack', 'babel', 'jest', 'cypress', 'selenium', 'figma', 'sketch'
    ];

    const foundSkills = skillKeywords.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(rawText)
    );

    // Extract seniority
    let seniority: string | undefined;
    if (text.includes('senior') || text.includes('sr.')) seniority = 'Senior';
    else if (text.includes('lead') || text.includes('principal')) seniority = 'Lead';
    else if (text.includes('junior') || text.includes('jr.')) seniority = 'Junior';
    else if (text.includes('mid') || text.includes('intermediate')) seniority = 'Mid';

    // Extract sections by common patterns
    const extractBulletPoints = (section: string): string[] => {
      const bulletRegex = /[•\-\*]\s*(.+?)(?=[•\-\*]|$)/g;
      const matches = [];
      let match;
      
      while ((match = bulletRegex.exec(section)) !== null) {
        const point = match[1].trim();
        if (point.length > 10) {
          matches.push(point);
        }
      }
      
      // Also try numbered lists
      const numberedRegex = /\d+\.\s*(.+?)(?=\d+\.|$)/g;
      while ((match = numberedRegex.exec(section)) !== null) {
        const point = match[1].trim();
        if (point.length > 10) {
          matches.push(point);
        }
      }

      return matches.slice(0, 8); // Limit to 8 items
    };

    // Split text into sections
    const responsibilitySection = this.extractSection(rawText, [
      'responsibilities', 'duties', 'role', 'you will', 'what you\'ll do'
    ]);
    
    const requirementSection = this.extractSection(rawText, [
      'requirements', 'qualifications', 'must have', 'required', 'essential'
    ]);
    
    const niceToHaveSection = this.extractSection(rawText, [
      'nice to have', 'preferred', 'bonus', 'plus', 'advantageous', 'desirable'
    ]);

    return {
      skills: foundSkills,
      responsibilities: extractBulletPoints(responsibilitySection),
      requirements: extractBulletPoints(requirementSection),
      niceToHave: extractBulletPoints(niceToHaveSection),
      seniority
    };
  }

  private static extractSection(text: string, keywords: string[]): string {
    const lowerText = text.toLowerCase();
    
    for (const keyword of keywords) {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex !== -1) {
        // Extract 500 characters after the keyword
        const sectionStart = keywordIndex;
        const sectionEnd = Math.min(sectionStart + 1000, text.length);
        return text.substring(sectionStart, sectionEnd);
      }
    }
    
    return '';
  }

  static createJobDescription(parsed: Partial<JobDescription>): JobDescription {
    const structuredInfo = this.extractStructuredInfo(parsed.rawText || '');
    
    return {
      id: `jd-${Date.now()}`,
      title: parsed.title || 'Unknown Position',
      company: parsed.company || 'Unknown Company',
      location: parsed.location || 'Unknown Location',
      seniority: structuredInfo.seniority,
      skills: structuredInfo.skills,
      responsibilities: structuredInfo.responsibilities,
      requirements: structuredInfo.requirements,
      niceToHave: structuredInfo.niceToHave,
      rawText: parsed.rawText || '',
      scrapedAt: new Date().toISOString(),
      source: parsed.source || 'manual'
    };
  }
}