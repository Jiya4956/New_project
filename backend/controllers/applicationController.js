const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');

exports.applyForScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.body.scholarship);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    if (!scholarship.isActive) {
      return res.status(400).json({ message: 'Scholarship is not active' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      scholarship: req.body.scholarship,
      student: req.user._id,
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }
    
    const application = await Application.create({
      scholarship: req.body.scholarship,
      student: req.user._id,
      personalInfo: req.body.personalInfo,
      applicationLetter: req.body.applicationLetter,
      documents: req.body.documents || [],
    });
    
    await application.populate('scholarship', 'title provider');
    
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('scholarship', 'title provider amount deadline')
      .sort('-createdAt');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarship')
      .populate('student', 'name email')
      .populate('reviewedBy', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is owner or admin
    if (application.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('scholarship', 'title provider')
      .populate('student', 'name email')
      .sort('-createdAt');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = status || application.status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    
    await application.save();
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

