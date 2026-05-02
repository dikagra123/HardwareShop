import { useEffect, useState } from 'react';
import { getDashboardStats, getJobs } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getJobs()])
      .then(([s, j]) => {
        setStats(s.data);
        setRecentJobs(j.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/><p>Loading dashboard...</p></div>;

  const cards = [
    { icon: '📋', label: 'Total Jobs', value: stats?.totalJobs || 0, color: '#0984e3' },
    { icon: '⏳', label: 'Pending', value: stats?.pendingJobs || 0, color: '#fdcb6e' },
    { icon: '🔨', label: 'In Progress', value: stats?.inProgressJobs || 0, color: '#e17055' },
    { icon: '👥', label: 'Customers', value: stats?.totalCustomers || 0, color: '#00b894' },
    { icon: '💰', label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#6c5ce7' },
    { icon: '📅', label: 'This Month', value: `₹${(stats?.monthRevenue || 0).toLocaleString('en-IN')}`, color: '#00cec9' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/paint-estimator" className="btn btn-primary">🎨 New Paint Estimate</Link>
          <Link to="/repair-estimator" className="btn btn-secondary">🔧 New Repair Estimate</Link>
        </div>
      </div>

      {stats?.lowStockItems > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          ⚠️ <strong>{stats.lowStockItems} item(s)</strong> are running low in inventory.
          <Link to="/inventory" style={{ marginLeft: 8, color: '#721c24', fontWeight: 600 }}>View Inventory →</Link>
        </div>
      )}

      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="icon">{card.icon}</div>
            <div className="label">{card.label}</div>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="card-title" style={{ margin: 0 }}>Recent Job Orders</h2>
            <Link to="/jobs" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#636e72', padding: 30 }}>No jobs yet. Create your first estimate!</td></tr>
                ) : recentJobs.map(job => (
                  <tr key={job.id}>
                    <td><Link to={`/jobs/${job.id}`} style={{ color: '#0984e3', fontWeight: 600 }}>#{job.id}</Link></td>
                    <td>{job.customer_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{job.job_type}</td>
                    <td><span className={`badge badge-${job.status}`}>{job.status.replace('_', ' ')}</span></td>
                    <td>{job.total_estimate ? `₹${parseFloat(job.total_estimate).toLocaleString('en-IN')}` : '—'}</td>
                    <td>{new Date(job.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎨</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Paint Estimator</h3>
            <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>Calculate paint quantity & cost for any room instantly.</p>
            <Link to="/paint-estimator" style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Start Estimating →</Link>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Repair Estimator</h3>
            <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>Get instant repair cost breakdown for any job type.</p>
            <Link to="/repair-estimator" style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Start Estimating →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}