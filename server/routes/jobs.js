const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authMiddleware } = require('../middleware/auth');

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
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { customerId, jobType, description, address, scheduledDate, notes } = req.body;
  if (!customerId || !jobType) return res.status(400).json({ error: 'Customer and job type required' });
  try {
    const job = await Job.create({ customer: customerId, jobType, description, address, scheduledDate, notes });
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
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