const prisma = require('../lib/prisma');

exports.getAllScholarships = async (req, res) => {
  try {
    const { category, country, page = 1, limit = 12, sort = '-createdAt', search, educationLevel } = req.query;

    const where = { isActive: true };

    if (category) where.category = category;
    if (country) where.country = { contains: country, mode: 'insensitive' };

    // Education level filter (stored inside eligibility JSON)
    // We'll filter in-app after fetch since Prisma JSON filtering varies by provider

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine orderBy
    let orderBy = { createdAt: 'desc' };
    if (sort === 'createdAt') orderBy = { createdAt: 'asc' };
    else if (sort === '-amount') orderBy = { amount: 'desc' };
    else if (sort === 'amount') orderBy = { amount: 'asc' };
    else if (sort === 'deadline') orderBy = { deadline: 'asc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy,
        take: parseInt(limit),
        skip,
      }),
      prisma.scholarship.count({ where }),
    ]);

    // Post-filter by educationLevel in eligibility JSON
    if (educationLevel) {
      scholarships = scholarships.filter(s => {
        const elig = s.eligibility;
        return elig && elig.educationLevel === educationLevel;
      });
    }

    // Map for frontend compat
    const mapped = scholarships.map(s => ({
      ...s,
      _id: s.id,
      createdBy: s.createdBy ? { ...s.createdBy, _id: s.createdById } : undefined,
    }));

    res.json({
      scholarships: mapped,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: req.params.id },
      include: { createdBy: { select: { name: true, email: true } } },
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({ ...scholarship, _id: scholarship.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const { title, description, provider, category, country, amount, currency,
            deadline, educationLevel, website, applicationProcess, documents } = req.body;

    const scholarship = await prisma.scholarship.create({
      data: {
        title,
        description,
        provider,
        category,
        country,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        deadline: new Date(deadline),
        eligibility: { educationLevel: educationLevel || 'Any' },
        website,
        applicationProcess,
        documents: documents || [],
        createdById: req.user.id,
      },
    });

    res.status(201).json({ ...scholarship, _id: scholarship.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    let scholarship = await prisma.scholarship.findUnique({
      where: { id: req.params.id },
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (req.user.role !== 'admin' && scholarship.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this scholarship' });
    }

    const { title, description, provider, category, country, amount, currency,
            deadline, educationLevel, website, applicationProcess } = req.body;

    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (provider) data.provider = provider;
    if (category) data.category = category;
    if (country) data.country = country;
    if (amount) data.amount = parseFloat(amount);
    if (currency) data.currency = currency;
    if (deadline) data.deadline = new Date(deadline);
    if (educationLevel) data.eligibility = { educationLevel };
    if (website !== undefined) data.website = website;
    if (applicationProcess !== undefined) data.applicationProcess = applicationProcess;

    scholarship = await prisma.scholarship.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ ...scholarship, _id: scholarship.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: req.params.id },
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (req.user.role !== 'admin' && scholarship.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this scholarship' });
    }

    await prisma.scholarship.delete({ where: { id: req.params.id } });

    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
