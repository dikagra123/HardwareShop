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
  const {
    customerId,
    customer,
    jobType,
    description,
    address,
    scheduledDate,
    notes,
    workerId,
    worker,
    totalEstimate,
    paintEstimates,
    repairItems,
    status
  } = req.body;

  try {
    const custId = customerId || customer;
    if (!custId) {
      return res.status(400).json({ error: 'Customer is required to create a job' });
    }

    const job = await Job.create({
      customer: custId,
      jobType: jobType || 'repair',
      description: description || '',
      address: address || '',
      scheduledDate: scheduledDate || undefined,
      notes: notes || '',
      worker: workerId || worker || undefined,
      totalEstimate: parseFloat(totalEstimate || 0),
      paintEstimates: paintEstimates || [],
      repairItems: repairItems || [],
      status: status || 'pending'
    });

    const populated = await Job.findById(job._id)
      .populate('customer', 'name phone email')
      .populate('worker', 'name phone');

    res.status(201).json(populated);
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