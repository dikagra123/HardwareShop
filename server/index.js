const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./models/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/jobs',      require('./routes/jobs'));
app.use('/api/estimates', require('./routes/estimates'));
app.use('/api/invoices',  require('./routes/invoices'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/uploads',   require('./routes/uploads'));
app.use('/api/notify',    require('./routes/notifications'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hardware Shop API running', timestamp: new Date() });
});
app.use(cors({
  origin : '*' ,
  //   'http://localhost:3000',
  //   'https://hardware-shop1.onrender.com',
  //   // 'https://hardware-shop-nine.vercel.app',
  //   'https://hardwareshop03.netlify.app/'  // ← add your Netlify URL
  // ],
  credentials: false
}));
  
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));