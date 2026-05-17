const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authMiddleware } = require('../middleware/auth');
const Invoice = require('../models/Invoice');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.jobType = req.query.type;
    const jobs = await Job.find(filter)
      .populate('customer', 'name phone')
      .populate('worker', 'name phone')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('worker', 'name phone');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Get invoice for this job
    const invoice = await Invoice.findOne({ job: req.params.id });

    res.json({ ...job.toObject(), invoice: invoice || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { jobId, taxPercent, discount } = req.body;
  try {
    // Check if invoice already exists
    const existing = await Invoice.findOne({ job: jobId });
    if (existing) return res.status(400).json({ error: 'Invoice already exists for this job' });

    const job = await Job.findById(jobId).populate('customer');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const subtotal = parseFloat(job.totalEstimate || 0);
    const tax = parseFloat(taxPercent || 0);
    const disc = parseFloat(discount || 0);
    const taxAmount = parseFloat(((subtotal * tax) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount - disc).toFixed(2));
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await Invoice.create({
      job: jobId,
      invoiceNumber,
      subtotal,
      taxPercent: tax,
      taxAmount,
      discount: disc,
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'unpaid'
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.workerId) update.worker = req.body.workerId;
    const job = await Job.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;