import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getDashboardStats, getJobs, getInvoices, getInventory } from '../api';

const COLORS = ['#e17055', '#0984e3', '#00b894', '#fdcb6e', '#6c5ce7', '#fd79a8'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #dfe6e9', borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {label && <div style={{ fontSize: 12, color: '#636e72', marginBottom: 6 }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color || '#2d3436' }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Charts() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    Promise.all([getDashboardStats(), getJobs(), getInvoices()])
      .then(([s, j, inv]) => {
        setStats(s.data);
        setJobs(j.data);
        setInvoices(inv.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading charts...</p>
    </div>
  );

  // ── Data Processing ───────────────────────────────────────────

  // 1. Monthly Revenue (last 6 months)
  const monthlyRevenue = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const revenue = invoices
        .filter(inv => {
          if (!inv.paidAt && inv.payment_status !== 'paid' && inv.paymentStatus !== 'paid') return false;
          const invDate = new Date(inv.paidAt || inv.createdAt);
          const invKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
          return invKey === monthKey;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.paidAmount || inv.paid_amount || 0), 0);

      const jobsCount = jobs.filter(j => {
        const jDate = new Date(j.createdAt || j.created_at);
        const jKey = `${jDate.getFullYear()}-${String(jDate.getMonth() + 1).padStart(2, '0')}`;
        return jKey === monthKey;
      }).length;

      months.push({ month: monthName, revenue: Math.round(revenue), jobs: jobsCount });
    }
    return months;
  };

  // 2. Job Status Distribution
  const jobStatusData = () => {
    const statusCount = {};
    jobs.forEach(j => {
      const s = j.status || 'pending';
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value
    }));
  };

  // 3. Top Services
  const topServicesData = () => {
    const services = { repair: 0, paint: 0, both: 0 };
    jobs.forEach(j => {
      const type = j.jobType || j.job_type || 'repair';
      services[type] = (services[type] || 0) + 1;
    });
    return [
      { name: '🔧 Repair', count: services.repair, color: '#e17055' },
      { name: '🎨 Paint', count: services.paint, color: '#0984e3' },
      { name: '🔧🎨 Both', count: services.both, color: '#00b894' },
    ].filter(s => s.count > 0);
  };

  // 4. Revenue vs Estimates (last 6 months)
  const revenueVsEstimates = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const estimates = jobs
        .filter(j => {
          const jDate = new Date(j.createdAt || j.created_at);
          const jKey = `${jDate.getFullYear()}-${String(jDate.getMonth() + 1).padStart(2, '0')}`;
          return jKey === monthKey;
        })
        .reduce((sum, j) => sum + parseFloat(j.totalEstimate || j.total_estimate || 0), 0);

      const collected = invoices
        .filter(inv => {
          const invDate = new Date(inv.createdAt || inv.created_at);
          const invKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
          return invKey === monthKey;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.paidAmount || inv.paid_amount || 0), 0);

      months.push({
        month: monthName,
        estimates: Math.round(estimates),
        collected: Math.round(collected),
      });
    }
    return months;
  };

  const revenueData = monthlyRevenue();
  const statusData = jobStatusData();
  const servicesData = topServicesData();
  const revVsEst = revenueVsEstimates();

  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.paidAmount || i.paid_amount || 0), 0);
  const totalEstimates = jobs.reduce((s, j) => s + parseFloat(j.totalEstimate || j.total_estimate || 0), 0);
  const collectionRate = totalEstimates > 0 ? ((totalRevenue / totalEstimates) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics & Charts</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>
            Business performance overview
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { icon: '💰', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#00b894' },
          { icon: '📋', label: 'Total Jobs', value: stats?.totalJobs || jobs.length, color: '#0984e3' },
          { icon: '👥', label: 'Customers', value: stats?.totalCustomers || 0, color: '#6c5ce7' },
          { icon: '📈', label: 'Collection Rate', value: `${collectionRate}%`, color: '#e17055' },
        ].map(card => (
          <div key={card.label} className="stat-card">
            <div className="icon">{card.icon}</div>
            <div className="label">{card.label}</div>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Chart 1 — Monthly Revenue Bar Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#2d3436' }}>📅 Monthly Revenue</h2>
            <p style={{ fontSize: 13, color: '#636e72', marginTop: 2 }}>Revenue collected over last 6 months</p>
          </div>
          <div style={{ background: '#e17055', color: 'white', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
            Last 6 Months
          </div>
        </div>
        {revenueData.every(d => d.revenue === 0) ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div>No revenue data yet. Complete some jobs to see charts!</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#636e72' }} />
              <YAxis tick={{ fontSize: 12, fill: '#636e72' }}
                tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue (₹)" fill="#e17055" radius={[6, 6, 0, 0]} />
              <Bar dataKey="jobs" name="Jobs Count" fill="#0984e3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart 2 + 3 — Pie Charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Job Status Pie */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#2d3436', marginBottom: 4 }}>
            🔄 Job Status Distribution
          </h2>
          <p style={{ fontSize: 13, color: '#636e72', marginBottom: 16 }}>Breakdown of all job statuses</p>
          {statusData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
              No jobs yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" labelLine={false} label={renderPieLabel}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {statusData.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#636e72' }}>{entry.name}: <strong>{entry.value}</strong></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top Services Pie */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#2d3436', marginBottom: 4 }}>
            🏆 Top Services
          </h2>
          <p style={{ fontSize: 13, color: '#636e72', marginBottom: 16 }}>Most popular service types</p>
          {servicesData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
              No jobs yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={servicesData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={90}
                    dataKey="count" labelLine={false} label={renderPieLabel}>
                    {servicesData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value + ' jobs', name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {servicesData.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                    <span style={{ color: '#636e72' }}>{entry.name}: <strong>{entry.count}</strong></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart 4 — Revenue vs Estimates Area Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#2d3436' }}>📈 Revenue vs Estimates</h2>
            <p style={{ fontSize: 13, color: '#636e72', marginTop: 2 }}>Estimated value compared to collected revenue</p>
          </div>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '6px 14px', fontSize: 13 }}>
            Collection Rate: <strong style={{ color: '#00b894' }}>{collectionRate}%</strong>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revVsEst} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="estimateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0984e3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0984e3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b894" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#636e72' }} />
            <YAxis tick={{ fontSize: 12, fill: '#636e72' }}
              tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="estimates" name="Estimated (₹)"
              stroke="#0984e3" fill="url(#estimateGrad)" strokeWidth={2} dot={{ r: 4 }} />
            <Area type="monotone" dataKey="collected" name="Collected (₹)"
              stroke="#00b894" fill="url(#revenueGrad)" strokeWidth={2} dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20,
          padding: '16px', background: '#f8f9fa', borderRadius: 10 }}>
          {[
            { label: 'Total Estimated', value: `₹${totalEstimates.toLocaleString('en-IN')}`, color: '#0984e3' },
            { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#00b894' },
            { label: 'Outstanding', value: `₹${(totalEstimates - totalRevenue).toLocaleString('en-IN')}`, color: '#e17055' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#636e72', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}