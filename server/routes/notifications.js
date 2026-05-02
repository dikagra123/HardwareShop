const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

router.use(authMiddleware);

// ── Helper: build WhatsApp link ──────────────────────────────────
const getWhatsAppLink = (phone, message) => {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  const phoneWithCode = clean.startsWith('91') ? clean : `91${clean}`;
  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
};

// ── Message Templates ────────────────────────────────────────────
const templates = {
  estimateReady: (name, jobId, amount) =>
    `Hello ${name}! 🏪\n\nYour estimate from *HardwareShop* is ready.\n\n` +
    `📋 Job ID: ${String(jobId).slice(-5).toUpperCase()}\n` +
    `💰 Estimated Cost: ₹${amount}\n\n` +
    `Our team will contact you shortly.\nThank you! 🙏`,

  statusChanged: (name, jobId, status) => {
    const map = {
      approved:    '✅ Your job has been *APPROVED*! We will start work soon.',
      in_progress: '🔨 Work has *STARTED* on your job! Our team is on it.',
      completed:   '🎉 Your job is *COMPLETED*! Please review the work.',
      cancelled:   '❌ Your job has been *CANCELLED*. Please contact us.',
    };
    return `Hello ${name}! 👋\n\n` +
      (map[status] || `Your job status updated to: ${status}`) +
      `\n\n📋 Job ID: ${String(jobId).slice(-5).toUpperCase()}` +
      `\n\nThank you for choosing *HardwareShop*! 🏪`;
  },

  invoiceGenerated: (name, jobId, invoiceNumber, amount) =>
    `Hello ${name}! 🧾\n\n*Invoice Generated*\n\n` +
    `📋 Job ID: ${String(jobId).slice(-5).toUpperCase()}\n` +
    `🧾 Invoice: ${invoiceNumber}\n` +
    `💰 Amount Due: ₹${amount}\n\n` +
    `Payment: Cash / UPI / Bank Transfer\n\n` +
    `Thank you for choosing *HardwareShop*! 🙏`,

  paymentReceived: (name, amount, invoiceNumber) =>
    `Hello ${name}! ✅\n\n*Payment Received*\n\n` +
    `💰 Amount: ₹${amount}\n` +
    `🧾 Invoice: ${invoiceNumber}\n\n` +
    `Thank you for your payment! 🙏\n*HardwareShop* 🏪`,
};

// ── POST /api/notify/estimate/:jobId ─────────────────────────────
router.post('/estimate/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('customer');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.customer) return res.status(400).json({ error: 'No customer linked to this job' });

    const message = templates.estimateReady(
      job.customer.name,
      job._id,
      (job.totalEstimate || 0).toLocaleString('en-IN')
    );
    const whatsAppLink = getWhatsAppLink(job.customer.phone, message);

    res.json({ success: true, whatsAppLink, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notify/status/:jobId ───────────────────────────────
router.post('/status/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('customer');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.customer) return res.status(400).json({ error: 'No customer linked to this job' });

    const message = templates.statusChanged(
      job.customer.name,
      job._id,
      job.status
    );
    const whatsAppLink = getWhatsAppLink(job.customer.phone, message);

    res.json({ success: true, whatsAppLink, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notify/invoice/:invoiceId ──────────────────────────
router.post('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate({ path: 'job', populate: { path: 'customer' } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const customer = invoice.job?.customer;
    if (!customer) return res.status(400).json({ error: 'No customer found for this invoice' });

    const message = templates.invoiceGenerated(
      customer.name,
      invoice.job._id,
      invoice.invoiceNumber,
      (invoice.totalAmount || 0).toLocaleString('en-IN')
    );
    const whatsAppLink = getWhatsAppLink(customer.phone, message);

    res.json({ success: true, whatsAppLink, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notify/payment/:invoiceId ──────────────────────────
router.post('/payment/:invoiceId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate({ path: 'job', populate: { path: 'customer' } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const customer = invoice.job?.customer;
    if (!customer) return res.status(400).json({ error: 'No customer found' });

    const message = templates.paymentReceived(
      customer.name,
      (invoice.paidAmount || 0).toLocaleString('en-IN'),
      invoice.invoiceNumber
    );
    const whatsAppLink = getWhatsAppLink(customer.phone, message);

    res.json({ success: true, whatsAppLink, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/notify/quick ───────────────────────────────────────
router.post('/quick', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });
  const whatsAppLink = getWhatsAppLink(phone, message);
  res.json({ success: true, whatsAppLink });
});

module.exports = router;