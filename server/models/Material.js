const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  unit: String,
  pricePerUnit: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  lowStockAlert: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);