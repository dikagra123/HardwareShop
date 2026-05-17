const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

// Generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Build WhatsApp link with OTP message
const getWhatsAppOTPLink = (phone, otp) => {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  const phoneWithCode = clean.startsWith('91') ? clean : `91${clean}`;
  const message = `Your HardwareShop verification code is: *${otp}*\n\nThis OTP is valid for 10 minutes.\n\nDo not share this code with anyone.`;
  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
};

// POST /api/customer-auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create customer
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      if (!name) return res.status(400).json({ error: 'Name is required for new customers', needsName: true });
      customer = await Customer.create({ name, phone, otp, otpExpiry });
    } else {
      customer.otp = otp;
      customer.otpExpiry = otpExpiry;
      await customer.save();
    }

    // Generate WhatsApp link to send OTP
    const whatsAppLink = getWhatsAppOTPLink(phone, otp);

    res.json({
      success: true,
      message: 'OTP generated successfully',
      whatsAppLink,
      otp, // In production remove this - only for testing
      customerName: customer.name,
      isNewCustomer: !customer.isVerified,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer-auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  try {
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Check OTP
    if (customer.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    // Check expiry
    if (new Date() > customer.otpExpiry) return res.status(400).json({ error: 'OTP expired. Please request a new one.' });

    // Mark as verified
    customer.isVerified = true;
    customer.otp = null;
    customer.otpExpiry = null;
    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, name: customer.name, phone: customer.phone, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: 'customer',
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer-auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { phone } = req.body;
  try {
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const otp = generateOTP();
    customer.otp = otp;
    customer.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await customer.save();

    const whatsAppLink = getWhatsAppOTPLink(phone, otp);

    res.json({ success: true, whatsAppLink, otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;