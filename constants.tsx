
import React from 'react';
import { University, PastQuestion, Badge } from './types';

export const SYSTEM_BADGES: Badge[] = [
  { id: 'time_bronze', name: 'Dedicated Learner', description: 'Spent 5 hours studying', icon: 'Clock', color: 'text-amber-600', level: 'bronze', requirementType: 'hours', requirementValue: 5, image: 'https://cdn-icons-png.flaticon.com/512/8146/8146811.png' },
  { id: 'time_silver', name: 'Study Specialist', description: 'Spent 20 hours studying', icon: 'Clock', color: 'text-slate-400', level: 'silver', requirementType: 'hours', requirementValue: 20, image: 'https://cdn-icons-png.flaticon.com/512/8146/8146820.png' },
  { id: 'time_gold', name: 'Knowledge Monk', description: 'Spent 100 hours studying', icon: 'Clock', color: 'text-yellow-500', level: 'gold', requirementType: 'hours', requirementValue: 100, image: 'https://cdn-icons-png.flaticon.com/512/8146/8146835.png' },
  
  { id: 'action_bronze', name: 'Active Inquisitor', description: 'Performed 20 actions in Study Hub', icon: 'Brain', color: 'text-amber-600', level: 'bronze', requirementType: 'actions', requirementValue: 20, image: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' },
  { id: 'action_silver', name: 'Deep Thinker', description: 'Performed 100 actions in Study Hub', icon: 'Brain', color: 'text-slate-400', level: 'silver', requirementType: 'actions', requirementValue: 100, image: 'https://cdn-icons-png.flaticon.com/512/4333/4333615.png' },
  { id: 'action_gold', name: 'Neural Master', description: 'Performed 500 actions in Study Hub', icon: 'Brain', color: 'text-yellow-500', level: 'gold', requirementType: 'actions', requirementValue: 500, image: 'https://cdn-icons-png.flaticon.com/512/4333/4333621.png' },
  
  { id: 'contrib_bronze', name: 'Asset Contributor', description: 'Uploaded 5 past questions', icon: 'Upload', color: 'text-amber-600', level: 'bronze', requirementType: 'uploads', requirementValue: 5, image: 'https://cdn-icons-png.flaticon.com/512/6211/6211181.png' },
  { id: 'contrib_silver', name: 'Legacy Architect', description: 'Uploaded 20 past questions', icon: 'Upload', color: 'text-slate-400', level: 'silver', requirementType: 'uploads', requirementValue: 20, image: 'https://cdn-icons-png.flaticon.com/512/6211/6211195.png' },
  
  { id: 'ref_bronze', name: 'Networker', description: 'Referred 5 successful students', icon: 'Users', color: 'text-amber-600', level: 'bronze', requirementType: 'referrals', requirementValue: 5, image: 'https://cdn-icons-png.flaticon.com/512/2354/2354573.png' },
  { id: 'ref_silver', name: 'Community Pillar', description: 'Referred 25 successful students', icon: 'Users', color: 'text-slate-400', level: 'silver', requirementType: 'referrals', requirementValue: 25, image: 'https://cdn-icons-png.flaticon.com/512/2354/2354580.png' },
];

export const UNIVERSITIES: University[] = [
  { id: 'ui', name: 'University of Ibadan', acronym: 'UI', location: 'Ibadan, Oyo', logo: 'https://picsum.photos/seed/ui/200' },
  { id: 'unilag', name: 'University of Lagos', acronym: 'UNILAG', location: 'Akoka, Lagos', logo: 'https://picsum.photos/seed/unilag/200' },
  { id: 'oau', name: 'Obafemi Awolowo University', acronym: 'OAU', location: 'Ile-Ife, Osun', logo: 'https://picsum.photos/seed/oau/200' },
  { id: 'unn', name: 'University of Nigeria, Nsukka', acronym: 'UNN', location: 'Nsukka, Enugu', logo: 'https://picsum.photos/seed/unn/200' },
  { id: 'abu', name: 'Ahmadu Bello University', acronym: 'ABU', location: 'Zaria, Kaduna', logo: 'https://picsum.photos/seed/abu/200' },
  { id: 'uniben', name: 'University of Benin', acronym: 'UNIBEN', location: 'Benin, Edo', logo: 'https://picsum.photos/seed/uniben/200' },
  { id: 'unilorin', name: 'University of Ilorin', acronym: 'UNILORIN', location: 'Ilorin, Kwara', logo: 'https://picsum.photos/seed/unilorin/200' },
  { id: 'uniport', name: 'University of Port Harcourt', acronym: 'UNIPORT', location: 'Port Harcourt, Rivers', logo: 'https://picsum.photos/seed/uniport/200' },
  { id: 'funaab', name: 'Federal University of Agriculture, Abeokuta', acronym: 'FUNAAB', location: 'Abeokuta, Ogun', logo: 'https://picsum.photos/seed/funaab/200' },
];

export const MOCK_QUESTIONS: PastQuestion[] = [
  {
    id: 'q1',
    universityId: 'ui',
    courseCode: 'GSP 101',
    courseTitle: 'Use of English',
    year: 2023,
    semester: 'First',
    faculty: 'Arts',
    department: 'English',
    level: '100',
    description: 'General Studies Programme examination paper.',
    fileUrl: '#',
    type: 'document',
    status: 'approved',
    uploadedBy: 'admin',
    createdAt: Date.now()
  },
  {
    id: 'q2',
    universityId: 'funaab',
    courseCode: 'CSC 201',
    courseTitle: 'Computer Programming I',
    year: 2022,
    semester: 'First',
    faculty: 'COLPHYS',
    department: 'Computer Science',
    level: '200',
    description: 'Introduction to C programming.',
    fileUrl: '#',
    type: 'document',
    status: 'approved',
    uploadedBy: 'admin',
    createdAt: Date.now()
  }
];

export const UNIVERSITY_COLLEGES: Record<string, string[]> = {
  funaab: ['COLAMATS', 'COLANIM', 'COLPLANT', 'COLERM', 'COLVET', 'COLFHEC', 'COLPHYS', 'COLBIOS', 'COLENG', 'COLMAS'],
  ui: ['Arts', 'Science', 'Basic Medical Sciences', 'Clinical Sciences', 'Public Health', 'Pharmacy', 'Law', 'Agriculture', 'The Social Sciences', 'Education', 'Technology', 'Veterinary Medicine'],
  unilag: ['Arts', 'Social Sciences', 'Business Administration', 'Law', 'Science', 'Engineering', 'Environmental Sciences', 'Education', 'College of Medicine'],
  oau: ['Agriculture', 'Arts', 'Education', 'Engineering', 'Environmental Design and Management', 'Law', 'Pharmacy', 'Health Sciences', 'Science', 'Social Sciences', 'Technology']
};

export const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  // FUNAAB Restored Departments
  'COLAMATS': ['Agricultural Economics and Farm Management', 'Agricultural Extension and Rural Development', 'Agricultural Administration'],
  'COLANIM': ['Animal Breeding and Genetics', 'Animal Nutrition', 'Animal Physiology', 'Animal Production and Health', 'Pasture and Range Management'],
  'COLPLANT': ['Crop Protection', 'Horticulture', 'Plant Breeding and Seed Technology', 'Plant Physiology and Crop Ecology', 'Soil Science and Land Management'],
  'COLERM': ['Aquaculture and Fisheries Management', 'Environmental Management and Toxicology', 'Forestry and Wildlife Management', 'Water Resources Management and Agrometeorology'],
  'COLVET': ['Veterinary Anatomy', 'Veterinary Medicine', 'Veterinary Microbiology and Pathology', 'Veterinary Parasitology and Entomology', 'Veterinary Physiology and Pharmacology', 'Veterinary Public Health and Reproduction'],
  'COLFHEC': ['Food Science and Technology', 'Home Science and Management', 'Nutrition and Dietetics', 'Hospitality and Tourism'],
  'COLPHYS': ['Chemistry', 'Mathematics', 'Physics', 'Statistics', 'Computer Science'],
  'COLBIOS': ['Biochemistry', 'Microbiology', 'Pure and Applied Zoology', 'Pure and Applied Botany'],
  'COLENG': ['Agricultural and Bio-Resources Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronics Engineering'],
  'COLMAS': ['Accounting', 'Business Administration', 'Banking and Finance', 'Economics'],

  // UI Departments
  'Science': ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Microbiology', 'Botany', 'Zoology', 'Geology', 'Statistics'],
  'Engineering': ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Petroleum Engineering', 'Chemical Engineering'],
  'Arts': ['English', 'Linguistics', 'History', 'Philosophy', 'Theatre Arts', 'Religious Studies'],
  'Technology': ['Computer Science', 'Food Science', 'Agricultural Engineering'],
  'Social Sciences': ['Economics', 'Political Science', 'Sociology', 'Geography', 'Psychology'],
  'Medicine': ['Anatomy', 'Physiology', 'Biochemistry', 'Medicine and Surgery', 'Nursing Science'],
  'Agriculture': ['Animal Science', 'Crop Science', 'Soil Science', 'Agricultural Economics'],
  'Education': ['Guidance and Counselling', 'Educational Management', 'Social Science Education']
};

export const COMMON_FACULTIES = [
  'Agriculture',
  'Arts',
  'Basic Medical Sciences',
  'Biological Sciences',
  'Clinical Sciences',
  'Education',
  'Engineering',
  'Environmental Sciences',
  'Law',
  'Management Sciences',
  'Pharmaceutical Sciences',
  'Physical Sciences',
  'Social Sciences',
  'Technology',
  'Veterinary Medicine'
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Universities', path: '/universities' },
  { name: 'Study Hub', path: '/study-hub' },
  { name: 'Community', path: '/community' },
  { name: 'Contribute', path: '/upload' },
  { name: 'Study AI', path: '/ai-assistant' },
];
