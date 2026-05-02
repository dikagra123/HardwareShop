const mongoose = require('mongoose');

const paintEstimateSchema = new mongoose.Schema({
  roomName: String,
  length: Number, width: Number, height: Number,
  numDoors: Number, numWindows: Number,
  paintType: String, brand: String, finishType: String,
  numCoats: Number,
  paintableArea: Number, litersNeeded: Number,
  paintCost: Number, laborCost: Number, totalCost: Number,
});

const repairItemSchema = new mongoose.Schema({
  itemType: String,
  description: String,
  quantity: Number,
  laborCost: Number,
  materialCost: Number,
  totalCost: Number,
});

const jobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  jobType: { type: String, enum: ['repair', 'paint', 'both'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  description: String,
  address: String,
  scheduledDate: Date,
  totalEstimate: { type: Number, default: 0 },
  notes: String,
  paintEstimates: [paintEstimateSchema],
  repairItems: [repairItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);