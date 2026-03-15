import { UserProfile, JobDescription } from '../types';

export const sampleProfile: UserProfile = {
  basics: {
    name: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    links: {
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      portfolio: "https://alexjohnson.dev"
    }
  },
  skills: [
    { id: '1', name: 'React', category: 'Frontend', proficiency: 5 },
    { id: '2', name: 'TypeScript', category: 'Language', proficiency: 5 },
    { id: '3', name: 'Node.js', category: 'Backend', proficiency: 4 },
    { id: '4', name: 'Python', category: 'Language', proficiency: 4 },
    { id: '5', name: 'AWS', category: 'Cloud', proficiency: 4 },
    { id: '6', name: 'Docker', category: 'DevOps', proficiency: 4 },
    { id: '7', name: 'PostgreSQL', category: 'Database', proficiency: 4 },
    { id: '8', name: 'GraphQL', category: 'API', proficiency: 3 },
    { id: '9', name: 'MongoDB', category: 'Database', proficiency: 3 },
    { id: '10', name: 'Kubernetes', category: 'DevOps', proficiency: 3 }
  ],
  experience: [
    {
      id: '1',
      company: 'TechCorp Inc.',
      role: 'Senior Software Engineer',
      startDate: '2022-01',
      location: 'San Francisco, CA',
      achievements: [
        'Led development of customer dashboard serving 100K+ users, improving user engagement by 35%',
        'Architected microservices migration reducing system latency by 40% and improving scalability',
        'Mentored 3 junior engineers and established code review processes improving team velocity by 25%',
        'Implemented automated testing pipeline reducing bugs in production by 60%'
      ],
      technologies: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker']
    },
    {
      id: '2',
      company: 'StartupXYZ',
      role: 'Full Stack Developer',
      startDate: '2020-03',
      endDate: '2021-12',
      location: 'Remote',
      achievements: [
        'Built MVP from scratch serving 10K+ users within 6 months of launch',
        'Developed real-time chat system handling 1M+ messages daily with 99.9% uptime',
        'Optimized database queries reducing page load times by 50%',
        'Integrated payment processing system generating $500K+ ARR'
      ],
      technologies: ['React', 'Python', 'Django', 'PostgreSQL', 'Redis', 'AWS']
    }
  ],
  education: [
    {
      id: '1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      startDate: '2016-08',
      endDate: '2020-05',
      highlights: ['Graduated Magna Cum Laude', 'Dean\'s List 6 semesters'],
      gpa: '3.8'
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'AWS Certified Solutions Architect',
      description: 'Professional level certification demonstrating cloud architecture expertise',
      date: '2023-03',
      category: 'certification'
    },
    {
      id: '2',
      title: 'Best Innovation Award',
      description: 'Recognized for developing AI-powered code review tool adopted company-wide',
      date: '2022-12',
      category: 'award'
    }
  ]
};

export const sampleJobDescription: JobDescription = {
  id: 'sample-jd-1',
  title: 'Senior Frontend Engineer',
  company: 'Innovative Tech Co.',
  location: 'New York, NY',
  seniority: 'Senior',
  skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'GraphQL', 'Jest', 'Cypress'],
  responsibilities: [
    'Lead frontend development for our core product serving millions of users',
    'Collaborate with design and product teams to implement user-centric features',
    'Mentor junior developers and establish best practices',
    'Optimize application performance and user experience'
  ],
  requirements: [
    '5+ years of professional frontend development experience',
    'Expert knowledge of React and TypeScript',
    'Experience with modern build tools and testing frameworks',
    'Strong understanding of web performance optimization',
    'Excellent communication and collaboration skills'
  ],
  niceToHave: [
    'Experience with GraphQL and Apollo Client',
    'Knowledge of Node.js and backend technologies',
    'Previous experience in a leadership role',
    'Contributions to open source projects'
  ],
  rawText: 'Senior Frontend Engineer job description...',
  scrapedAt: new Date().toISOString(),
  source: 'manual'
};