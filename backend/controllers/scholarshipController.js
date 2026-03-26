const Scholarship = require('../models/Scholarship');

exports.getAllScholarships = async (req, res) => {
  try {
    const { category, country, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (country) query.country = country;
    
    const scholarships = await Scholarship.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Scholarship.countDocuments(query);
    
    res.json({
      scholarships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    res.json(scholarship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.create({
      ...req.body,
      createdBy: req.user._id,
    });
    
    res.status(201).json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    let scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    // Check if user is admin or creator
    if (req.user.role !== 'admin' && scholarship.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this scholarship' });
    }
    
    scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    // Check if user is admin or creator
    if (req.user.role !== 'admin' && scholarship.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this scholarship' });
    }
    
    await scholarship.deleteOne();
    
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

