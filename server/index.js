const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./models/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// CORS - must be FIRST before everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());


// Serve uploaded images
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
app.use('/api/settings',  require('./routes/settings'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hardware Shop API running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));