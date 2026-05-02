-- Hardware Shop Repair & Paint Estimation System
-- Run this in your PostgreSQL database (Supabase SQL editor or psql)

-- Drop tables if exist (for fresh setup)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS paint_estimates CASCADE;
DROP TABLE IF EXISTS repair_items CASCADE;
DROP TABLE IF EXISTS job_orders CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (admin/staff login)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workers table
CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  role VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Materials / Inventory table
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit VARCHAR(20),
  price_per_unit DECIMAL(10,2) NOT NULL,
  stock_quantity DECIMAL(10,2) DEFAULT 0,
  low_stock_alert DECIMAL(10,2) DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job Orders table
CREATE TABLE job_orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  worker_id INTEGER REFERENCES workers(id),
  job_type VARCHAR(50) CHECK (job_type IN ('repair', 'paint', 'both')),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  address TEXT,
  scheduled_date DATE,
  total_estimate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Repair Items table
CREATE TABLE repair_items (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_orders(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) DEFAULT 1,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  material_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (labor_cost + material_cost) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Paint Estimates table
CREATE TABLE paint_estimates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_orders(id) ON DELETE CASCADE,
  room_name VARCHAR(100),
  length DECIMAL(8,2),
  width DECIMAL(8,2),
  height DECIMAL(8,2),
  num_doors INTEGER DEFAULT 0,
  num_windows INTEGER DEFAULT 0,
  paint_type VARCHAR(50),
  brand VARCHAR(100),
  finish_type VARCHAR(50),
  num_coats INTEGER DEFAULT 2,
  paintable_area DECIMAL(10,2),
  liters_needed DECIMAL(10,2),
  paint_cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_orders(id),
  invoice_number VARCHAR(50) UNIQUE,
  subtotal DECIMAL(10,2),
  tax_percent DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  due_date DATE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@hardwareshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed sample materials
INSERT INTO materials (name, category, unit, price_per_unit, stock_quantity) VALUES
('Asian Paints Emulsion Interior', 'paint', 'liter', 280, 100),
('Berger Easy Clean Interior', 'paint', 'liter', 260, 80),
('Nerolac Excel Total', 'paint', 'liter', 310, 60),
('Asian Paints Primer', 'paint', 'liter', 180, 50),
('Wall Putty (White)', 'material', 'kg', 30, 200),
('Sand Paper (120 grit)', 'material', 'piece', 15, 500),
('Paint Brush (2 inch)', 'tool', 'piece', 45, 100),
('Paint Roller', 'tool', 'piece', 80, 50),
('Turpentine Oil', 'material', 'liter', 120, 30),
('Wall Crack Filler', 'material', 'kg', 45, 100);

-- Seed sample workers
INSERT INTO workers (name, phone, role) VALUES
('Ramesh Kumar', '9876543210', 'Painter'),
('Suresh Singh', '9876543211', 'Repair Specialist'),
('Mahesh Patel', '9876543212', 'Carpenter');

SELECT 'Database setup complete!' as message;