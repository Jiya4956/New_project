/**
 * Seed Script for Scholar Connect
 * Run this script to populate the database with sample data
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');
const Application = require('./models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholar-connect';

// Sample Scholarships Data
const scholarships = [
  {
    title: 'Fulbright Foreign Student Program',
    description: 'The Fulbright Program offers fully funded scholarships for international students to study in the United States. The program covers tuition, living expenses, and travel costs.',
    provider: 'US Department of State',
    category: 'International',
    country: 'United States',
    amount: 50000,
    currency: 'USD',
    deadline: new Date('2024-12-31'),
    eligibility: {
      ageMin: 18,
      ageMax: 35,
      educationLevel: 'Graduate',
      gpaMin: 3.5,
      requirements: [
        'Bachelor\'s degree required',
        'English proficiency (TOEFL/IELTS)',
        'Strong academic record',
        'Leadership potential'
      ]
    },
    applicationProcess: 'Submit online application with transcripts, letters of recommendation, and personal statement.',
    documents: [
      'Academic transcripts',
      'Recommendation letters',
      'Personal statement',
      'TOEFL/IELTS scores',
      'Passport copy'
    ],
    website: 'https://fulbrightprogram.org',
    contactEmail: 'fulbright@state.gov',
  },
  {
    title: 'Chevening Scholarships',
    description: 'Chevening Scholarships enable outstanding emerging leaders from all over the world to pursue one-year master\'s degrees in the UK. The scholarship covers tuition fees, living allowance, and return flights.',
    provider: 'UK Government',
    category: 'International',
    country: 'United Kingdom',
    amount: 42000,
    currency: 'GBP',
    deadline: new Date('2024-11-15'),
    eligibility: {
      ageMin: 25,
      ageMax: 45,
      educationLevel: 'Graduate',
      gpaMin: 3.0,
      requirements: [
        'Minimum 2 years work experience',
        'Bachelor\'s degree',
        'Return to home country after studies',
        'Leadership qualities'
      ]
    },
    applicationProcess: 'Complete online application form, attend interview if shortlisted.',
    documents: [
      'Completed Chevening application',
      'Academic transcripts',
      'References',
      'Work experience documentation'
    ],
    website: 'https://www.chevening.org',
    contactEmail: 'chevening@fcdo.gov.uk',
  },
  {
    title: 'Microsoft Research PhD Scholarship',
    description: 'Fully funded PhD scholarship with stipend for outstanding students pursuing research in computer science, artificial intelligence, and related fields.',
    provider: 'Microsoft Research',
    category: 'Academic',
    country: 'Multiple',
    amount: 35000,
    currency: 'USD',
    deadline: new Date('2024-10-31'),
    eligibility: {
      educationLevel: 'Postgraduate',
      gpaMin: 3.7,
      requirements: [
        'Master\'s degree or equivalent',
        'Research proposal',
        'Publications preferred',
        'Academic excellence'
      ]
    },
    applicationProcess: 'Submit research proposal, academic records, and letters of recommendation.',
    documents: [
      'Research proposal',
      'Academic transcripts',
      'CV with publications',
      'Recommendation letters',
      'Writing samples'
    ],
    website: 'https://www.microsoft.com/en-us/research/',
  },
  {
    title: 'Commonwealth Scholarship and Fellowship',
    description: 'Fully funded scholarships for master\'s and PhD studies for citizens of Commonwealth countries. The scholarship covers tuition, living expenses, and travel.',
    provider: 'Commonwealth Scholarship Commission',
    category: 'International',
    country: 'Multiple',
    amount: 30000,
    currency: 'GBP',
    deadline: new Date('2024-12-01'),
    eligibility: {
      ageMin: 18,
      ageMax: 35,
      educationLevel: 'Any',
      gpaMin: 3.0,
      requirements: [
        'Citizenship of Commonwealth country',
        'Bachelor\'s degree (minimum 2:1)',
        'Strong academic record',
        'Commitment to development'
      ]
    },
    applicationProcess: 'Apply through Commonwealth Scholarship Commission online portal.',
    documents: [
      'Application form',
      'Academic transcripts',
      'References',
      'Proof of citizenship',
      'English proficiency certificate'
    ],
    website: 'https://cscuk.fcdo.gov.uk',
    contactEmail: 'info@cscuk.org.uk',
  },
  {
    title: 'Gates Cambridge Scholarship',
    description: 'Full-cost scholarship for outstanding applicants from countries outside the UK to pursue postgraduate studies at the University of Cambridge.',
    provider: 'Bill and Melinda Gates Foundation',
    category: 'Academic',
    country: 'United Kingdom',
    amount: 45000,
    currency: 'GBP',
    deadline: new Date('2024-12-15'),
    eligibility: {
      educationLevel: 'Postgraduate',
      gpaMin: 3.8,
      requirements: [
        'Excellent academic record',
        'Leadership potential',
        'Commitment to improving lives of others',
        'Admission to Cambridge'
      ]
    },
    applicationProcess: 'Apply for admission to Cambridge and Gates Cambridge Scholarship simultaneously.',
    documents: [
      'Cambridge application',
      'Gates Cambridge application',
      'Academic transcripts',
      'Personal statement',
      'References',
      'Research proposal (for PhD)'
    ],
    website: 'https://www.gatescambridge.org',
    contactEmail: 'info@gatescambridge.org',
  },
];

// Initialize Database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Scholarship.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@scholarconnect.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        phone: '+1-234-567-8900',
        address: '123 Admin Street',
        country: 'USA',
        dateOfBirth: new Date('1990-01-01'),
      },
    });
    console.log('Created admin user');

    // Create Student User
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      profile: {
        phone: '+1-234-567-8901',
        address: '456 Student Avenue',
        country: 'Canada',
        dateOfBirth: new Date('2000-05-15'),
      },
    });
    console.log('Created student user');

    // Create Scholarships with admin as creator
    const createdScholarships = [];
    for (const scholarship of scholarships) {
      const created = await Scholarship.create({
        ...scholarship,
        createdBy: admin._id,
      });
      createdScholarships.push(created);
      console.log(`Created scholarship: ${created.title}`);
    }

    // Create a sample application
    if (createdScholarships.length > 0) {
      await Application.create({
        scholarship: createdScholarships[0]._id,
        student: student._id,
        status: 'Pending',
        personalInfo: {
          phone: '+1-234-567-8901',
          address: '456 Student Avenue',
          country: 'Canada',
          dateOfBirth: new Date('2000-05-15'),
          education: {
            currentLevel: 'Graduate',
            university: 'University of Toronto',
            gpa: 3.8,
            major: 'Computer Science',
          },
        },
        applicationLetter: 'I am applying for this scholarship to further my studies in computer science and contribute to the field of AI.',
      });
      console.log('Created sample application');
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin - Email: admin@scholarconnect.com, Password: admin123');
    console.log('Student - Email: student@example.com, Password: student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed script
seedDatabase();

