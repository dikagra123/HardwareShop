const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const { authMiddleware } = require('../middleware/auth');

// Create uploads folder
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `damage-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // reject silently
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/uploads/damage/:jobId
router.post('/damage/:jobId', authMiddleware, (req, res, next) => {
  upload.array('photos', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Files received:', req.files);
    console.log('Body:', req.body);

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: 'No valid photos uploaded. Use JPG, PNG or WEBP.' });
    }

    const photos = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      description: req.body.description || '',
      uploadedAt: new Date()
    }));

    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { $push: { damagePhotos: { $each: photos } } },
      { new: true }
    );

    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.status(201).json({
      message: `${photos.length} photo(s) uploaded successfully`,
      photos,
      totalPhotos: job.damagePhotos.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/uploads/damage/:jobId
router.get('/damage/:jobId', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).select('damagePhotos');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job.damagePhotos || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/uploads/damage/:jobId/:filename
router.delete('/damage/:jobId/:filename', authMiddleware, async (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Job.findByIdAndUpdate(req.params.jobId, {
      $pull: { damagePhotos: { filename: req.params.filename } }
    });
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;