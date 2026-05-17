const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$stockQuantity', '$lowStockAlert'] };
    const materials = await Material.find(filter).sort({ name: 1 });
    res.json(materials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json(material);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/stock', async (req, res) => {
  const { quantity, operation } = req.body;
  const inc = operation === 'subtract' ? -parseFloat(quantity) : parseFloat(quantity);
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { stockQuantity: inc } },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Item not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(material);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const inProgressJobs = await Job.countDocuments({ status: 'in_progress' });
    const totalCustomers = await Customer.countDocuments();
    const lowStockItems = await Material.countDocuments({ $expr: { $lte: ['$stockQuantity', '$lowStockAlert'] } });
    const revenueData = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    const monthRevenueData = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid', paidAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    res.json({
      totalJobs, pendingJobs, inProgressJobs, totalCustomers, lowStockItems,
      totalRevenue: revenueData[0]?.total || 0,
      monthRevenue: monthRevenueData[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;