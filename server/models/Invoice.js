const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  invoiceNumber: { type: String, unique: true },
  subtotal: Number,
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  dueDate: Date,
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);