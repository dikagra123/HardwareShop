const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

// Store settings in a JSON file
const settingsFile = path.join(__dirname, '../data/settings.json');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const defaultSettings = {
  shopName: 'HardwareShop',
  tagline: 'Repair & Paint Estimation System',
  phone: '', phone2: '', email: '',
  address: '', city: '', state: '', pincode: '',
  gstNumber: '', taxPercent: 0, logoUrl: '',
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
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
};

// Logo upload config
const logoDir = path.join(__dirname, '../uploads/logo');
if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoDir),
  filename: (req, file, cb) => cb(null, `shop-logo${path.extname(file.originalname)}`)
});

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

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

// POST /api/settings/logo
router.post('/logo', authMiddleware, (req, res, next) => {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No logo uploaded' });
    const logoUrl = `/uploads/logo/${req.file.filename}`;
    const updated = { ...readSettings(), logoUrl, updatedAt: new Date().toISOString() };
    writeSettings(updated);
    res.json({ success: true, logoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/logo
router.delete('/logo', authMiddleware, (req, res) => {
  try {
    const current = readSettings();
    if (current.logoUrl) {
      const filePath = path.join(__dirname, '..', current.logoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    const updated = { ...current, logoUrl: '', updatedAt: new Date().toISOString() };
    writeSettings(updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;