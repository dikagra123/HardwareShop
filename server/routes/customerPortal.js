const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

// Customer auth middleware
const customerAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'customer') return res.status(403).json({ error: 'Customer access only' });
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/customer-portal/profile
router.get('/profile', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-otp -otpExpiry');
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer-portal/jobs
router.get('/jobs', customerAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.customer.id })
      .populate('worker', 'name phone role')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer-portal/jobs/:id
router.get('/jobs/:id', customerAuth, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, customer: req.customer.id })
      .populate('worker', 'name phone role');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const invoice = await Invoice.findOne({ job: req.params.id });
    res.json({ ...job.toObject(), invoice: invoice || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer-portal/invoices
router.get('/invoices', customerAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.customer.id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    const invoices = await Invoice.find({ job: { $in: jobIds } })
      .populate('job', 'jobType description createdAt')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer-portal/stats
router.get('/stats', customerAuth, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ customer: req.customer.id });
    const completedJobs = await Job.countDocuments({ customer: req.customer.id, status: 'completed' });
    const pendingJobs = await Job.countDocuments({ customer: req.customer.id, status: 'pending' });
    const inProgressJobs = await Job.countDocuments({ customer: req.customer.id, status: 'in_progress' });

    const jobs = await Job.find({ customer: req.customer.id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    const invoices = await Invoice.find({ job: { $in: jobIds } });
    const totalSpent = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const pendingPayment = invoices.filter(i => i.paymentStatus !== 'paid').reduce((s, i) => s + (i.totalAmount || 0), 0);

    res.json({ totalJobs, completedJobs, pendingJobs, inProgressJobs, totalSpent, pendingPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;