import { UserProfile, ExperienceItem, EducationItem } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export class Validators {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{10,}$/;
    return phoneRegex.test(phone);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateDateRange(startDate: string, endDate?: string): boolean {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    return start <= end && start >= new Date('1950-01-01');
  }

  static validateProfile(profile: UserProfile): ValidationError[] {
    const errors: ValidationError[] = [];

    // Basic info validation
    if (!profile.basics.name.trim()) {
      errors.push({ field: 'basics.name', message: 'Name is required' });
    }

    if (!profile.basics.email.trim()) {
      errors.push({ field: 'basics.email', message: 'Email is required' });
    } else if (!this.validateEmail(profile.basics.email)) {
      errors.push({ field: 'basics.email', message: 'Invalid email format' });
    }

    if (profile.basics.phone && !this.validatePhone(profile.basics.phone)) {
      errors.push({ field: 'basics.phone', message: 'Invalid phone format' });
    }

    // Links validation
    Object.entries(profile.basics.links).forEach(([key, url]) => {
      if (url && !this.validateUrl(url)) {
        errors.push({ field: `basics.links.${key}`, message: 'Invalid URL format' });
      }
    });

    // Experience validation
    profile.experience.forEach((exp, index) => {
      if (!exp.company.trim()) {
        errors.push({ field: `experience.${index}.company`, message: 'Company name is required' });
      }
      
      if (!exp.role.trim()) {
        errors.push({ field: `experience.${index}.role`, message: 'Role is required' });
      }

      if (!this.validateDateRange(exp.startDate, exp.endDate)) {
        errors.push({ field: `experience.${index}.dates`, message: 'Invalid date range' });
      }
    });

    // Education validation
    profile.education.forEach((edu, index) => {
      if (!edu.school.trim()) {
        errors.push({ field: `education.${index}.school`, message: 'School name is required' });
      }
      
      if (!edu.degree.trim()) {
        errors.push({ field: `education.${index}.degree`, message: 'Degree is required' });
      }

      if (!this.validateDateRange(edu.startDate, edu.endDate)) {
        errors.push({ field: `education.${index}.dates`, message: 'Invalid date range' });
      }
    });

    // Skills validation
    if (profile.skills.length === 0) {
      errors.push({ field: 'skills', message: 'At least one skill is required' });
    }

    profile.skills.forEach((skill, index) => {
      if (!skill.name.trim()) {
        errors.push({ field: `skills.${index}.name`, message: 'Skill name is required' });
      }
      
      if (skill.proficiency < 1 || skill.proficiency > 5) {
        errors.push({ field: `skills.${index}.proficiency`, message: 'Proficiency must be between 1 and 5' });
      }
    });

    return errors;
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
  }

  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
  }

  static normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
}