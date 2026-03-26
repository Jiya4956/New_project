const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          country: true,
          dateOfBirth: true,
          marks: true,
          gpa: true,
          course: true,
          university: true,
          income: true,
          category: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Map flat fields to nested `profile` shape for frontend compatibility
      req.user = {
        ...user,
        _id: user.id, // compat alias
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
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
