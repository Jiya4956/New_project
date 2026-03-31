const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const email = require('../lib/emailService');
const { createNotification, getAdmins } = require('../lib/notificationService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Role is always 'student' — admin accounts can only be created directly in the DB

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'student',
      },
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });

    // Notify all admins (non-blocking — runs after response)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    getAdmins().then(admins => {
      admins.forEach(admin => {
        createNotification({
          userId: admin.id,
          type: 'new_user',
          title: '👤 New User Registered',
          message: `${user.name} (${user.email}) just signed up.`,
          link: `${frontendUrl}/admin`,
        });
        email.sendAdminNewUser(admin.email, user);
      });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account access has been revoked. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true,
        phone: true, address: true, country: true, dateOfBirth: true,
        marks: true, gpa: true, course: true, university: true,
        income: true, category: true, createdAt: true, googleId: true,
      },
    });

    // Map to frontend-compatible shape
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      googleId: user.googleId,
      createdAt: user.createdAt,
      profile: {
        phone: user.phone,
        address: user.address,
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        marks: user.marks,
        gpa: user.gpa,
        course: user.course,
        university: user.university,
        income: user.income,
        category: user.category,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: profile?.phone,
        address: profile?.address,
        country: profile?.country,
        dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
        marks: profile?.marks ? parseFloat(profile.marks) : undefined,
        gpa: profile?.gpa ? parseFloat(profile.gpa) : undefined,
        course: profile?.course,
        university: profile?.university,
        income: profile?.income,
        category: profile?.category,
      },
    });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        phone: user.phone,
        address: user.address,
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        marks: user.marks,
        gpa: user.gpa,
        course: user.course,
        university: user.university,
        income: user.income,
        category: user.category,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map id → _id for frontend compat
    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be boolean' });
    }
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({ message: 'You cannot revoke your own access' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    res.json({ ...updated, _id: updated.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
