const prisma = require('./prisma');

/**
 * Create an in-app notification for a specific user.
 * Fire-and-forget — never throws.
 */
const createNotification = async ({ userId, type, title, message, link }) => {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link: link || null },
    });
  } catch (err) {
    console.error('[NOTIFICATION ERROR]', err.message);
  }
};

/**
 * Get or find all admin users (cached for efficiency).
 */
const getAdmins = async () => {
  return prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, email: true, name: true },
  });
};

module.exports = { createNotification, getAdmins };
