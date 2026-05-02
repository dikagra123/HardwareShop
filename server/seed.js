const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Material = require('./models/Material');
const Worker = require('./models/Worker');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected...');

  // Admin user
  const hashed = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@hardwareshop.com' },
    { name: 'Admin', email: 'admin@hardwareshop.com', password: hashed, role: 'admin' },
    { upsert: true }
  );

  // Materials
  const materials = [
    { name: 'Asian Paints Emulsion Interior', category: 'paint', unit: 'liter', pricePerUnit: 280, stockQuantity: 100 },
    { name: 'Berger Easy Clean Interior', category: 'paint', unit: 'liter', pricePerUnit: 260, stockQuantity: 80 },
    { name: 'Nerolac Excel Total', category: 'paint', unit: 'liter', pricePerUnit: 310, stockQuantity: 60 },
    { name: 'Asian Paints Primer', category: 'paint', unit: 'liter', pricePerUnit: 180, stockQuantity: 50 },
    { name: 'Wall Putty White', category: 'material', unit: 'kg', pricePerUnit: 30, stockQuantity: 200 },
    { name: 'Paint Brush 2 inch', category: 'tool', unit: 'piece', pricePerUnit: 45, stockQuantity: 100 },
    { name: 'Paint Roller', category: 'tool', unit: 'piece', pricePerUnit: 80, stockQuantity: 50 },
  ];
  for (const m of materials) {
    await Material.findOneAndUpdate({ name: m.name }, m, { upsert: true });
  }

  // Workers
  const workers = [
    { name: 'Ramesh Kumar', phone: '9876543210', role: 'Painter' },
    { name: 'Suresh Singh', phone: '9876543211', role: 'Repair Specialist' },
    { name: 'Mahesh Patel', phone: '9876543212', role: 'Carpenter' },
  ];
  for (const w of workers) {
    await Worker.findOneAndUpdate({ phone: w.phone }, w, { upsert: true });
  }

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch(console.error);