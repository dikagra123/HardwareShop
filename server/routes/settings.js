const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

const settingsFile = path.join(__dirname, '../data/settings.json');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const defaultSettings = {
  shopName: 'Hardware Repair Shop',
  tagline: 'Paint Estimator System',
  phone: '', phone2: '', email: '',
  address: '', city: '', state: '', pincode: '',
  gstNumber: '', taxPercent: 0,
  logoBase64: '',
  logoUrl: '',
  workingHours: {
    monday:    { open: '09:00', close: '18:00', isOpen: true },
    tuesday:   { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday:  { open: '09:00', close: '18:00', isOpen: true },
    friday:    { open: '09:00', close: '18:00', isOpen: true },
    saturday:  { open: '09:00', close: '14:00', isOpen: true },
    sunday:    { open: '09:00', close: '14:00', isOpen: false },
  },
  currency: '₹',
  invoicePrefix: 'INV',
  invoiceNotes: 'Thank you for your business!',
  updatedAt: null,
};

const readSettings = () => {
  try {
    if (fs.existsSync(settingsFile)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) };
    }
  } catch {}
  return defaultSettings;
};

const writeSettings = (data) => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
};

// GET /api/settings
router.get('/', (req, res) => {
  res.json(readSettings());
});

// PUT /api/settings
router.put('/', authMiddleware, (req, res) => {
  try {
    const updated = { ...readSettings(), ...req.body, updatedAt: new Date().toISOString() };
    writeSettings(updated);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/logo — save logo as Base64
router.post('/logo', authMiddleware, (req, res) => {
  try {
    const { base64, mimeType } = req.body;
    if (!base64) return res.status(400).json({ error: 'No logo data provided' });

    const logoBase64 = `data:${mimeType || 'image/png'};base64,${base64}`;
    const current = readSettings();
    const updated = {
      ...current,
      logoBase64,
      logoUrl: '',
      updatedAt: new Date().toISOString()
    };
    writeSettings(updated);
    res.json({ success: true, logoBase64 });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/logo
router.delete('/logo', authMiddleware, (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, logoBase64: '', logoUrl: '', updatedAt: new Date().toISOString() };
    writeSettings(updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;