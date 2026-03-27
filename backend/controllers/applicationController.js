const prisma = require('../lib/prisma');
const email  = require('../lib/emailService');
const { createNotification, getAdmins } = require('../lib/notificationService');

exports.applyForScholarship = async (req, res) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: req.body.scholarship },
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (!scholarship.isActive) {
      return res.status(400).json({ message: 'Scholarship is not active' });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        scholarshipId_studentId: {
          scholarshipId: req.body.scholarship,
          studentId: req.user.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }

    const application = await prisma.application.create({
      data: {
        scholarshipId: req.body.scholarship,
        studentId: req.user.id,
        personalInfo: req.body.personalInfo || {},
        applicationLetter: req.body.applicationLetter,
      },
      include: {
        scholarship: { select: { title: true, provider: true, amount: true, currency: true } },
        student:     { select: { id: true, name: true, email: true } },
      },
    });

    // ── Fire notifications & emails (non-blocking) ──────────────────
    const student = application.student;
    const sch     = application.scholarship;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // In-app: student
    createNotification({
      userId:  student.id,
      type:    'application_submitted',
      title:   '✅ Application Submitted!',
      message: `Your application for "${sch.title}" has been submitted successfully.`,
      link:    `${frontendUrl}/my-applications`,
    });

    // Email: student
    email.sendApplicationSubmitted(student, sch);

    // Notify all admins
    getAdmins().then(admins => {
      admins.forEach(admin => {
        createNotification({
          userId:  admin.id,
          type:    'new_application',
          title:   '📋 New Application',
          message: `${student.name} applied for "${sch.title}".`,
          link:    `${frontendUrl}/admin`,
        });
        email.sendAdminNewApplication(admin.email, student, sch);
      });
    });
    // ───────────────────────────────────────────────────────────────

    res.status(201).json({
      ...application,
      _id: application.id,
      scholarship: { ...application.scholarship, _id: application.scholarshipId },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.user.id },
      include: {
        scholarship: {
          select: {
            id: true, title: true, provider: true, amount: true,
            deadline: true, currency: true, country: true, category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = applications.map(a => ({
      ...a,
      _id: a.id,
      scholarship: a.scholarship ? { ...a.scholarship, _id: a.scholarship.id } : null,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        scholarship: true,
        student: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.studentId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json({ ...application, _id: application.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        scholarship: { select: { id: true, title: true, provider: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = applications.map(a => ({
      ...a,
      _id: a.id,
      scholarship: a.scholarship ? { ...a.scholarship, _id: a.scholarship.id } : null,
      student: a.student ? { ...a.student, _id: a.student.id } : null,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        scholarship: { select: { title: true, provider: true } },
        student:     { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: status || application.status,
        reviewNotes,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // ── Notifications & emails (non-blocking) ───────────────────────
    if (status && status !== application.status) {
      const student = application.student;
      const sch     = application.scholarship;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // In-app: student
      createNotification({
        userId:  student.id,
        type:    'status_changed',
        title:   `Application ${status}`,
        message: `Your application for "${sch.title}" is now ${status}.`,
        link:    `${frontendUrl}/my-applications`,
      });

      // Email: student
      email.sendStatusChanged(student, sch, status, reviewNotes);
    }
    // ───────────────────────────────────────────────────────────────

    res.json({ ...updated, _id: updated.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
