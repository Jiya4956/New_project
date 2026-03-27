/**
 * Add 10 More Scholarships — Scholar Connect
 * Run: node add-scholarships.js
 * Does NOT wipe any existing data.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Prisma enum values must exactly match the schema:
// Academic | Need_Based | Merit_Based | International | Government | Private | Other

const newScholarships = [
  {
    title: 'PM Scholarship Scheme for Central Armed Police Forces',
    description: 'Prime Minister Scholarship Scheme provides financial assistance to dependent wards and widows of ex/serving Central Armed Police Forces & Railway Protection Force personnel. Covers tuition and other expenses for professional degree courses.',
    provider: 'Ministry of Home Affairs, India',
    category: 'Government',
    country: 'India',
    amount: 36000,
    currency: 'INR',
    deadline: new Date('2026-10-31'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Wards of CAPF/RPF personnel', '60% marks in 12th Standard', 'Indian citizenship', 'First-year professional degree course'] },
    applicationProcess: 'Apply through the National Scholarship Portal (NSP) at scholarships.gov.in with required documents.',
    documents: ['Service/discharge certificate of parent', '12th marksheet', 'Aadhaar card', 'Bank account details', 'Income certificate'],
    website: 'https://scholarships.gov.in',
    contactEmail: 'helpdesk@nsp.gov.in',
    isActive: true,
  },
  {
    title: 'Tata Scholarship for Cornell University',
    description: 'The Tata Scholarship fund supports Indian students pursuing undergraduate education at Cornell University. Recipients are selected based on academic excellence and financial need. Covers full tuition and living expenses.',
    provider: 'Tata Education and Development Trust',
    category: 'Need_Based',
    country: 'United States',
    amount: 6500000,
    currency: 'INR',
    deadline: new Date('2027-01-15'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Indian citizen', 'Admitted to Cornell University', 'Demonstrated financial need', 'Strong academic record'] },
    applicationProcess: 'Apply simultaneously with Cornell University undergraduate admission. Financial need assessed by Cornell.',
    documents: ['Cornell admission application', 'Financial need documentation', 'Academic transcripts', 'Recommendation letters', 'Personal essay'],
    website: 'https://www.cornell.edu/about/tata/',
    contactEmail: 'admissions@cornell.edu',
    isActive: true,
  },
  {
    title: 'Kishore Vaigyanik Protsahan Yojana (KVPY)',
    description: 'KVPY is a national programme of fellowship in Basic Sciences to attract exceptionally motivated students and nurture them for a career in research. Fellows receive monthly fellowship and annual contingency grant throughout their study.',
    provider: 'Department of Science and Technology, India',
    category: 'Academic',
    country: 'India',
    amount: 80000,
    currency: 'INR',
    deadline: new Date('2026-08-31'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Indian citizen', 'Enrolled in science stream', '60% marks in 10th/12th', 'Pursuing basic sciences'] },
    applicationProcess: 'Register online at kvpy.iisc.ac.in, appear for aptitude test, and interview for shortlisted candidates.',
    documents: ['Marksheets (10th/12th)', 'Current enrolment proof', 'Aadhaar card', 'Bank details', 'Photograph'],
    website: 'https://kvpy.iisc.ac.in',
    contactEmail: 'kvpy@iisc.ac.in',
    isActive: true,
  },
  {
    title: 'Aditya Birla Scholarships',
    description: 'Aditya Birla Group scholarships are awarded to top-ranking students at premier institutions (IITs, IIMs, BITS, and leading law/liberal arts colleges) in India. The scholarship celebrates meritorious students and grooms them to be future leaders.',
    provider: 'Aditya Birla Group',
    category: 'Merit_Based',
    country: 'India',
    amount: 65000,
    currency: 'INR',
    deadline: new Date('2026-09-15'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Admission to IIT/IIM/BITS/top colleges', 'Top performing fresher', 'Strong interview performance', 'Leadership qualities'] },
    applicationProcess: 'Apply through the Aditya Birla Scholarship portal. Campus interviews are held at participating institutions.',
    documents: ['Admission letter', 'Academic records', 'Recommendation letter', 'Personal statement', 'Photograph'],
    website: 'https://www.adityabirlascholars.net',
    contactEmail: 'scholarships@adityabirla.com',
    isActive: true,
  },
  {
    title: 'HDFC Bank Parivartan ECS Scholarship',
    description: "HDFC Bank's Parivartan initiative provides scholarships to meritorious students from economically weaker sections. This programme supports students in Classes 6-12, undergraduates, and ITI/vocational course students across India.",
    provider: 'HDFC Bank Ltd.',
    category: 'Need_Based',
    country: 'India',
    amount: 75000,
    currency: 'INR',
    deadline: new Date('2026-11-30'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Annual family income below Rs 2.5 lakh', 'Minimum 55% marks in previous exam', 'Indian citizen', 'Regular enrolled student'] },
    applicationProcess: 'Apply online via Buddy4Study portal. Submit documents and await verification.',
    documents: ['Aadhaar card', 'Income certificate', 'Marksheet', 'Bank passbook', 'School/college ID', 'Photograph'],
    website: 'https://www.buddy4study.com/hdfc-bank-parivartan-ecs-scholarship',
    contactEmail: 'support@buddy4study.com',
    isActive: true,
  },
  {
    title: 'INSPIRE Scholarship for Higher Education (SHE)',
    description: 'INSPIRE-SHE is a flagship science scholarship by the Government of India to attract talent to study natural and basic sciences. It provides a fellowship of Rs 80,000 per year to top performers in 10+2 who pursue B.Sc./B.S./Int. M.Sc./M.S. in natural sciences.',
    provider: 'Department of Science & Technology, Government of India',
    category: 'Government',
    country: 'India',
    amount: 80000,
    currency: 'INR',
    deadline: new Date('2026-12-31'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['Top 1% in 10+2 board exam OR JEE/NEET/KVPY qualifying', 'Pursuing B.Sc./B.S. in natural/basic sciences', 'Indian citizen', 'Age below 22'] },
    applicationProcess: 'Apply online at online-inspire.gov.in. Eligible students are directly identified or can self-nominate.',
    documents: ['10+2 marksheet', 'Proof of rank (JEE/NEET/KVPY)', 'College admission proof', 'Aadhaar card', 'Bank details'],
    website: 'https://online-inspire.gov.in',
    contactEmail: 'inspire-dst@gov.in',
    isActive: true,
  },
  {
    title: 'Reliance Foundation Undergraduate Scholarships',
    description: 'Reliance Foundation offers merit-cum-means scholarships to undergraduate students in Engineering & Technology and Humanities & Liberal Arts across top Indian universities. Scholars also receive mentoring, internship and networking opportunities.',
    provider: 'Reliance Foundation',
    category: 'Merit_Based',
    country: 'India',
    amount: 200000,
    currency: 'INR',
    deadline: new Date('2026-12-15'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['First-year undergraduate in Engineering/Humanities', 'Annual family income below Rs 15 lakh', 'Minimum 60% in 12th', 'Indian citizen'] },
    applicationProcess: 'Apply online through the Reliance Foundation Scholarship portal. Shortlisted candidates take an online test and interview.',
    documents: ['12th marksheet', 'Income certificate', 'College admission letter', 'Aadhaar card', 'Bank details', 'Photograph'],
    website: 'https://scholarships.reliancefoundation.org',
    contactEmail: 'scholarships@reliancefoundation.org',
    isActive: true,
  },
  {
    title: 'Sitaram Jindal Foundation Scholarship',
    description: 'The Sitaram Jindal Foundation provides need-based scholarships to meritorious students from economically weaker backgrounds in India. Covers courses from Class 10 onwards through postgraduate levels in various disciplines.',
    provider: 'Sitaram Jindal Foundation',
    category: 'Need_Based',
    country: 'India',
    amount: 36000,
    currency: 'INR',
    deadline: new Date('2026-09-30'),
    eligibility: { educationLevel: 'Any', requirements: ['Annual family income below Rs 2 lakh', 'Minimum 60% marks', 'Regular full-time Indian student', 'Not receiving other scholarships'] },
    applicationProcess: 'Download and fill the application form from the official website. Submit with required documents by post or in person.',
    documents: ['Application form', 'Aadhaar card', 'Income certificate', 'Marksheets (last 2 years)', 'Bank details', 'Photograph'],
    website: 'https://www.sitaramjindalfoundation.org',
    contactEmail: 'info@sitaramjindalfoundation.org',
    isActive: true,
  },
  {
    title: 'Google Generation Scholarship India',
    description: 'Google Generation Scholarship supports students demonstrating leadership and passion for technology and computer science. Selected students receive a financial award and an invitation to attend Google annual scholar retreat to connect with Googlers and fellow scholars.',
    provider: 'Google LLC',
    category: 'Merit_Based',
    country: 'India',
    amount: 400000,
    currency: 'INR',
    deadline: new Date('2026-12-01'),
    eligibility: { educationLevel: 'Undergraduate', requirements: ['B.Tech/B.E./B.S. in CS or related field', 'Demonstrated leadership', 'Commitment to diversity in tech', 'Strong academic record'] },
    applicationProcess: 'Apply via the Google Scholarships portal with academic transcripts, essays, and resume.',
    documents: ['Academic transcripts', 'Resume/CV', 'Two short essays', 'Proof of enrollment', 'Recommendation letter (optional)'],
    website: 'https://buildyourfuture.withgoogle.com/scholarships',
    contactEmail: 'apac-scholarships@google.com',
    isActive: true,
  },
  {
    title: 'Maulana Azad National Fellowship (MANF)',
    description: 'MANF provides fellowships to students belonging to six minority communities (Muslim, Christian, Sikh, Buddhist, Jain and Parsi) for pursuing M.Phil. and Ph.D. degrees from recognised universities/institutions. Covers JRF, SRF stipends and contingency.',
    provider: 'Ministry of Minority Affairs, Government of India',
    category: 'Government',
    country: 'India',
    amount: 360000,
    currency: 'INR',
    deadline: new Date('2026-10-15'),
    eligibility: { educationLevel: 'Postgraduate', requirements: ['Belongs to minority community (Muslim/Christian/Sikh/Buddhist/Jain/Parsi)', 'Registered M.Phil./Ph.D. student', 'Annual family income below Rs 6 lakh', 'Indian citizen'] },
    applicationProcess: 'Apply online at minorityaffairs.gov.in through the National Scholarship Portal with UGC NET/JRF or university admission letter.',
    documents: ['Community certificate', 'Income certificate', 'Aadhaar card', 'Admission letter from university', 'NET/JRF certificate (if applicable)', 'Bank details'],
    website: 'https://scholarships.gov.in',
    contactEmail: 'manf@ugc.ac.in',
    isActive: true,
  },
];

const run = async () => {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.error('No admin user found. Please log in as admin first or run seed.js.');
      process.exit(1);
    }
    console.log('Using admin:', admin.email);
    console.log('Adding', newScholarships.length, 'scholarships...\n');

    let added = 0;
    for (const sch of newScholarships) {
      try {
        const created = await prisma.scholarship.create({
          data: { ...sch, createdById: admin.id },
        });
        console.log('  Added:', created.title);
        added++;
      } catch (e) {
        console.log('  SKIP (error):', sch.title, '-', e.message.split('\n')[0]);
      }
    }

    console.log('\nDone!', added, 'scholarships added out of', newScholarships.length);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

run();
