const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Job = require('../models/Job');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: 'job',
        populate: { path: 'customer', select: 'name phone' }
      })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { jobId, taxPercent, discount, dueDate, paymentMethod } = req.body;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const subtotal = job.totalEstimate || 0;
    const tax = parseFloat(taxPercent || 0);
    const disc = parseFloat(discount || 0);
    const taxAmount = parseFloat(((subtotal * tax) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount - disc).toFixed(2));
    const invoice = await Invoice.create({
      job: jobId, invoiceNumber: `INV-${Date.now()}`,
      subtotal, taxPercent: tax, taxAmount, discount: disc,
      totalAmount, dueDate, paymentMethod
    });
    res.status(201).json(invoice);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/pay', async (req, res) => {
  const { paidAmount, paymentMethod } = req.body;
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    const paid = parseFloat(paidAmount);
    const status = paid >= invoice.totalAmount ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
    invoice.paidAmount = paid;
    invoice.paymentStatus = status;
    invoice.paymentMethod = paymentMethod;
    if (status === 'paid') {
      invoice.paidAt = new Date();
      await Job.findByIdAndUpdate(invoice.job, { status: 'completed' });
    }
    await invoice.save();
    res.json(invoice);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;