import { useEffect, useState } from 'react';
import { getDashboardStats, getJobs } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    Promise.all([getDashboardStats(), getJobs()])
      .then(([s, j]) => {
        setStats(s.data);
        setRecentJobs(j.data.slice(0, 5));
      })
      .catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  const cards = [
    { icon: 'ti-clipboard-list',  label: 'Total Jobs',    value: stats?.totalJobs || 0,                                     color: '#185FA5', bg: '#E6F1FB' },
    { icon: 'ti-clock',           label: 'Pending',       value: stats?.pendingJobs || 0,                                   color: '#854F0B', bg: '#FAEEDA' },
    { icon: 'ti-hammer',          label: 'In Progress',   value: stats?.inProgressJobs || 0,                                color: '#993C1D', bg: '#FAECE7' },
    { icon: 'ti-users',           label: 'Customers',     value: stats?.totalCustomers || 0,                                color: '#0F6E56', bg: '#E1F5EE' },
    { icon: 'ti-currency-rupee',  label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#534AB7', bg: '#EEEDFE' },
    { icon: 'ti-calendar-stats',  label: 'This Month',    value: `₹${(stats?.monthRevenue || 0).toLocaleString('en-IN')}`, color: '#0F6E56', bg: '#E1F5EE' },
  ];

  const statusColors = {
    pending:     { bg: '#FAEEDA', color: '#854F0B' },
    approved:    { bg: '#E6F1FB', color: '#185FA5' },
    in_progress: { bg: '#FAECE7', color: '#993C1D' },
    completed:   { bg: '#E1F5EE', color: '#0F6E56' },
    cancelled:   { bg: '#FCEBEB', color: '#A32D2D' },
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>
            Monitor your hardware business analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/paint-estimator" className="btn btn-primary">
            <i className="ti ti-paint" aria-hidden="true" /> New Paint Estimate
          </Link>
          <Link to="/repair-estimator" className="btn btn-secondary">
            <i className="ti ti-tool" aria-hidden="true" /> New Repair Estimate
          </Link>
        </div>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockItems > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <i className="ti ti-alert-triangle" aria-hidden="true" /> {' '}
          <strong>{stats.lowStockItems} item(s)</strong> running low in inventory.
          <Link to="/inventory" style={{ marginLeft: 8, color: '#721c24', fontWeight: 600 }}>
            View Inventory →
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {cards.map((card, i) => (
          <div key={card.label} className="stat-card">
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12
            }}>
              <i className={`ti ${card.icon}`}
                style={{ fontSize: 26, color: card.color }}
                aria-hidden="true" />
            </div>
            <div className="label">{card.label}</div>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-clipboard-list" style={{ color: '#185FA5' }} aria-hidden="true" />
            Recent Job Orders
          </h2>
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
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#636e72', padding: 30 }}>
                    <i className="ti ti-clipboard-off" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} aria-hidden="true" />
                    No jobs yet. Create your first estimate!
                  </td>
                </tr>
              ) : recentJobs.map(job => {
                const sc = statusColors[job.status] || { bg: '#f0f0f0', color: '#333' };
                const jobId = job._id || job.id;
                return (
                  <tr key={jobId}>
                    <td>
                      <Link to={`/jobs/${jobId}`} style={{ color: '#0984e3', fontWeight: 600 }}>
                        #{jobId.toString().slice(-5).toUpperCase()}
                      </Link>
                    </td>
                    <td>{job.customer?.name || job.customer_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {job.jobType === 'repair' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-tool" style={{ color: '#993C1D' }} aria-hidden="true" /> Repair
                        </span>
                      ) : job.jobType === 'paint' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-paint" style={{ color: '#185FA5' }} aria-hidden="true" /> Paint
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-tool" style={{ color: '#854F0B' }} aria-hidden="true" /> Both
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {job.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0984e3' }}>
                      {job.totalEstimate
                        ? `₹${parseFloat(job.totalEstimate).toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td style={{ fontSize: 13, color: '#636e72' }}>
                      {new Date(job.createdAt || job.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
          <i className="ti ti-paint" style={{ fontSize: 36, marginBottom: 8, display: 'block' }} aria-hidden="true" />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Paint Estimator</h3>
          <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>
            Calculate paint quantity and cost for any room instantly.
          </p>
          <Link to="/paint-estimator" style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
            Start Estimating →
          </Link>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' }}>
          <i className="ti ti-tool" style={{ fontSize: 36, marginBottom: 8, display: 'block' }} aria-hidden="true" />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Repair Estimator</h3>
          <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>
            Get instant repair cost breakdown for any job type.
          </p>
          <Link to="/repair-estimator" style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
            Start Estimating →
          </Link>
        </div>
      </div>
    </div>
  );
}