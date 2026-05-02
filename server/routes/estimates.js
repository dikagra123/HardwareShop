const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Material = require('../models/Material');
const { authMiddleware } = require('../middleware/auth');

function calculatePaintEstimate({ length, width, height, numDoors, numWindows, numCoats, pricePerLiter }) {
  const wallArea = 2 * (length * height + width * height);
  const ceilingArea = length * width;
  const paintableArea = Math.max(0, wallArea + ceilingArea - (numDoors || 0) * 1.89 - (numWindows || 0) * 1.4);
  const litersNeeded = parseFloat(((paintableArea / 10) * (numCoats || 2)).toFixed(2));
  const paintCost = parseFloat((litersNeeded * (pricePerLiter || 280)).toFixed(2));
  const laborCost = parseFloat((paintableArea * 15).toFixed(2));
  const totalCost = parseFloat((paintCost + laborCost).toFixed(2));
  return { paintableArea: parseFloat(paintableArea.toFixed(2)), litersNeeded, paintCost, laborCost, totalCost };
}

router.post('/paint/calculate', async (req, res) => {
  try {
    const { length, width, height, numDoors, numWindows, numCoats, brand } = req.body;
    let pricePerLiter = 280;
    if (brand) {
      const mat = await Material.findOne({ name: new RegExp(brand, 'i') });
      if (mat) pricePerLiter = mat.pricePerUnit;
    }
    const result = calculatePaintEstimate({
      length: parseFloat(length), width: parseFloat(width), height: parseFloat(height),
      numDoors: parseInt(numDoors) || 0, numWindows: parseInt(numWindows) || 0,
      numCoats: parseInt(numCoats) || 2, pricePerLiter
    });
    res.json({ ...result, pricePerLiter });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/paint', authMiddleware, async (req, res) => {
  const { jobId, roomName, length, width, height, numDoors, numWindows, paintType, brand, finishType, numCoats } = req.body;
  try {
    let pricePerLiter = 280;
    if (brand) {
      const mat = await Material.findOne({ name: new RegExp(brand, 'i') });
      if (mat) pricePerLiter = mat.pricePerUnit;
    }
    const calc = calculatePaintEstimate({
      length: parseFloat(length), width: parseFloat(width), height: parseFloat(height),
      numDoors: parseInt(numDoors) || 0, numWindows: parseInt(numWindows) || 0,
      numCoats: parseInt(numCoats) || 2, pricePerLiter
    });
    const job = await Job.findByIdAndUpdate(jobId,
      { $push: { paintEstimates: { roomName, length, width, height, numDoors, numWindows, paintType, brand, finishType, numCoats, ...calc } },
        $inc: { totalEstimate: calc.totalCost } },
      { new: true }
    );
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const repairRates = {
  wall_crack: { labor: 250, material: 150, unit: 'per crack' },
  wall_patch: { labor: 200, material: 120, unit: 'per sq ft' },
  furniture_polish: { labor: 500, material: 300, unit: 'per piece' },
  furniture_repair: { labor: 800, material: 400, unit: 'per piece' },
  door_fix: { labor: 400, material: 150, unit: 'per door' },
  window_fix: { labor: 350, material: 100, unit: 'per window' },
  pipe_repair: { labor: 450, material: 250, unit: 'per joint' },
  ceiling_repair: { labor: 600, material: 350, unit: 'per sq ft' },
  floor_repair: { labor: 700, material: 500, unit: 'per sq ft' },
  electrical_minor: { labor: 300, material: 200, unit: 'per point' },
};

router.get('/repair/rates', (req, res) => res.json(repairRates));

router.post('/repair/calculate', (req, res) => {
  const { repairType, quantity, urgency } = req.body;
  const rate = repairRates[repairType];
  if (!rate) return res.status(400).json({ error: 'Unknown repair type' });
  const qty = parseFloat(quantity) || 1;
  const multiplier = urgency === 'urgent' ? 1.5 : 1;
  const laborCost = parseFloat((rate.labor * qty * multiplier).toFixed(2));
  const materialCost = parseFloat((rate.material * qty).toFixed(2));
  res.json({ repairType, quantity: qty, urgency, laborCost, materialCost, totalCost: laborCost + materialCost, unit: rate.unit });
});

router.post('/repair', authMiddleware, async (req, res) => {
  const { jobId, itemType, description, quantity, laborCost, materialCost } = req.body;
  try {
    const totalCost = parseFloat(laborCost) + parseFloat(materialCost);
    const job = await Job.findByIdAndUpdate(jobId,
      { $push: { repairItems: { itemType, description, quantity, laborCost, materialCost, totalCost } },
        $inc: { totalEstimate: totalCost } },
      { new: true }
    );
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;