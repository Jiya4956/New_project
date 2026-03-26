/**
 * Seed Script for Scholar Connect (Prisma + PostgreSQL)
 * Run: node seed.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const scholarships = [
  {
    title: 'Fulbright Foreign Student Program',
    description: 'The Fulbright Program offers fully funded scholarships for international students to study in the United States.',
    provider: 'US Department of State',
    category: 'International',
    country: 'United States',
    amount: 50000,
    currency: 'USD',
    deadline: new Date('2026-12-31'),
    eligibility: {
      ageMin: 18, ageMax: 35, educationLevel: 'Graduate', gpaMin: 3.5,
      requirements: ["Bachelor's degree required", "English proficiency", "Strong academic record", "Leadership potential"],
    },
    applicationProcess: 'Submit online application with transcripts, letters of recommendation, and personal statement.',
    documents: ['Academic transcripts', 'Recommendation letters', 'Personal statement', 'TOEFL/IELTS scores', 'Passport copy'],
    website: 'https://fulbrightprogram.org',
    contactEmail: 'fulbright@state.gov',
  },
  {
    title: 'Chevening Scholarships',
    description: "Chevening Scholarships enable outstanding emerging leaders from all over the world to pursue one-year master's degrees in the UK.",
    provider: 'UK Government',
    category: 'International',
    country: 'United Kingdom',
    amount: 42000,
    currency: 'GBP',
    deadline: new Date('2026-11-15'),
    eligibility: {
      ageMin: 25, ageMax: 45, educationLevel: 'Graduate', gpaMin: 3.0,
      requirements: ["Minimum 2 years work experience", "Bachelor's degree", "Return to home country", "Leadership qualities"],
    },
    applicationProcess: 'Complete online application form, attend interview if shortlisted.',
    documents: ['Completed Chevening application', 'Academic transcripts', 'References', 'Work experience documentation'],
    website: 'https://www.chevening.org',
    contactEmail: 'chevening@fcdo.gov.uk',
  },
  {
    title: 'Microsoft Research PhD Scholarship',
    description: 'Fully funded PhD scholarship with stipend for outstanding students pursuing research in computer science and AI.',
    provider: 'Microsoft Research',
    category: 'Academic',
    country: 'Multiple',
    amount: 35000,
    currency: 'USD',
    deadline: new Date('2026-10-31'),
    eligibility: {
      educationLevel: 'Postgraduate', gpaMin: 3.7,
      requirements: ["Master's degree or equivalent", "Research proposal", "Publications preferred", "Academic excellence"],
    },
    applicationProcess: 'Submit research proposal, academic records, and letters of recommendation.',
    documents: ['Research proposal', 'Academic transcripts', 'CV with publications', 'Recommendation letters'],
    website: 'https://www.microsoft.com/en-us/research/',
  },
  {
    title: 'Commonwealth Scholarship and Fellowship',
    description: "Fully funded scholarships for master's and PhD studies for citizens of Commonwealth countries.",
    provider: 'Commonwealth Scholarship Commission',
    category: 'International',
    country: 'Multiple',
    amount: 30000,
    currency: 'GBP',
    deadline: new Date('2026-12-01'),
    eligibility: {
      ageMin: 18, ageMax: 35, educationLevel: 'Any', gpaMin: 3.0,
      requirements: ["Citizenship of Commonwealth country", "Bachelor's degree (minimum 2:1)", "Strong academic record"],
    },
    applicationProcess: 'Apply through Commonwealth Scholarship Commission online portal.',
    documents: ['Application form', 'Academic transcripts', 'References', 'Proof of citizenship'],
    website: 'https://cscuk.fcdo.gov.uk',
    contactEmail: 'info@cscuk.org.uk',
  },
  {
    title: 'Gates Cambridge Scholarship',
    description: 'Full-cost scholarship for outstanding applicants to pursue postgraduate studies at the University of Cambridge.',
    provider: 'Bill and Melinda Gates Foundation',
    category: 'Academic',
    country: 'United Kingdom',
    amount: 45000,
    currency: 'GBP',
    deadline: new Date('2026-12-15'),
    eligibility: {
      educationLevel: 'Postgraduate', gpaMin: 3.8,
      requirements: ["Excellent academic record", "Leadership potential", "Commitment to improving lives of others"],
    },
    applicationProcess: 'Apply for admission to Cambridge and Gates Cambridge Scholarship simultaneously.',
    documents: ['Cambridge application', 'Gates Cambridge application', 'Academic transcripts', 'Personal statement', 'References'],
    website: 'https://www.gatescambridge.org',
    contactEmail: 'info@gatescambridge.org',
  },
  {
    title: 'National Merit Scholarship India',
    description: 'Government of India merit-based scholarship for top-performing undergraduate students across all disciplines.',
    provider: 'Ministry of Education, India',
    category: 'Merit_Based',
    country: 'India',
    amount: 100000,
    currency: 'INR',
    deadline: new Date('2026-09-30'),
    eligibility: {
      educationLevel: 'Undergraduate', gpaMin: 3.5,
      requirements: ["Indian citizenship", "Top 10% in qualifying exam", "Annual family income below ₹6 Lakh"],
    },
    applicationProcess: 'Apply through the National Scholarship Portal (NSP).',
    documents: ['Marksheets', 'Income certificate', 'Caste certificate (if applicable)', 'Aadhaar card'],
    website: 'https://scholarships.gov.in',
  },
  {
    title: 'DAAD Scholarship for Development',
    description: 'German Academic Exchange Service scholarship for graduates from developing countries.',
    provider: 'DAAD',
    category: 'International',
    country: 'Germany',
    amount: 25000,
    currency: 'EUR',
    deadline: new Date('2026-08-31'),
    eligibility: {
      educationLevel: 'Graduate', gpaMin: 3.0,
      requirements: ["Bachelor's degree", "2 years work experience", "German or English proficiency"],
    },
    applicationProcess: 'Apply online through DAAD portal.',
    documents: ['CV', 'Motivation letter', 'Academic transcripts', 'Language certificates'],
    website: 'https://www.daad.de',
  },
];

const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await prisma.forumComment.deleteMany();
    await prisma.forumPost.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.application.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.message.deleteMany();
    await prisma.scholarship.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared all tables');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@scholarconnect.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1-234-567-8900',
        address: '123 Admin Street',
        country: 'USA',
        dateOfBirth: new Date('1990-01-01'),
      },
    });
    console.log('👤 Created admin user');

    // Create Student User
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.create({
      data: {
        name: 'Student User',
        email: 'student@example.com',
        password: studentPassword,
        role: 'student',
        phone: '+1-234-567-8901',
        address: '456 Student Avenue',
        country: 'India',
        dateOfBirth: new Date('2000-05-15'),
        course: 'B.Tech Computer Science',
        marks: 85,
        gpa: 3.8,
        university: 'IIT Delhi',
        income: '5L-8L',
        category: 'Merit-Based',
      },
    });
    console.log('👤 Created student user');

    // Create Scholarships
    const createdScholarships = [];
    for (const sch of scholarships) {
      const created = await prisma.scholarship.create({
        data: {
          ...sch,
          createdById: admin.id,
        },
      });
      createdScholarships.push(created);
      console.log(`📚 Created: ${created.title}`);
    }

    // Create sample application
    if (createdScholarships.length > 0) {
      await prisma.application.create({
        data: {
          scholarshipId: createdScholarships[0].id,
          studentId: student.id,
          status: 'Pending',
          personalInfo: {
            phone: '+1-234-567-8901',
            address: '456 Student Avenue',
            country: 'India',
            education: {
              currentLevel: 'Graduate',
              university: 'IIT Delhi',
              gpa: 3.8,
              major: 'Computer Science',
            },
          },
          applicationLetter: 'I am applying for this scholarship to further my studies in computer science and contribute to the field of AI.',
        },
      });
      console.log('📝 Created sample application');
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin — Email: admin@scholarconnect.com, Password: admin123');
    console.log('Student — Email: student@example.com, Password: student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
