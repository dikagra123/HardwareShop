import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusColors = {
  pending:     { bg: '#FAEEDA', color: '#854F0B' },
  approved:    { bg: '#E6F1FB', color: '#185FA5' },
  in_progress: { bg: '#FAECE7', color: '#993C1D' },
  completed:   { bg: '#E1F5EE', color: '#0F6E56' },
  cancelled:   { bg: '#FCEBEB', color: '#A32D2D' },
};

const statusSteps = ['pending', 'approved', 'in_progress', 'completed'];

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('customerToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/customer/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, statsRes, jobsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/customer-portal/profile`, { headers }),
        axios.get(`${API_URL}/api/customer-portal/stats`, { headers }),
        axios.get(`${API_URL}/api/customer-portal/jobs`, { headers }),
        axios.get(`${API_URL}/api/customer-portal/invoices`, { headers }),
      ]);
      setCustomer(profileRes.data);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
      setInvoices(invoicesRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        navigate('/customer/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    navigate('/customer/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff,#fdf0ff,#f0fff8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: '#636e72', marginTop: 12 }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff,#fdf0ff,#f0fff8)' }}>

      {/* Top navbar */}
      <div style={{ background: 'white', padding: '12px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#e17055,#d63031)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-building-store" style={{ color: 'white', fontSize: 16 }} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>HardwareShop</div>
            <div style={{ fontSize: 10, color: '#636e72' }}>Customer Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#2d3436' }}>
            Hi, <strong>{customer?.name}</strong>
          </div>
          <button onClick={logout}
            style={{ background: '#f8f9fa', border: '1px solid #dfe6e9', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#636e72', display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-logout" aria-hidden="true" /> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            My Dashboard
          </h1>
          <p style={{ color: '#636e72', fontSize: 13, marginTop: 4 }}>
            Track your repair and paint jobs
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: 'ti-clipboard-list', label: 'Total Jobs',   value: stats?.totalJobs || 0,      color: '#185FA5', bg: '#E6F1FB' },
            { icon: 'ti-clock',          label: 'Pending',      value: stats?.pendingJobs || 0,    color: '#854F0B', bg: '#FAEEDA' },
            { icon: 'ti-check',          label: 'Completed',    value: stats?.completedJobs || 0,  color: '#0F6E56', bg: '#E1F5EE' },
            { icon: 'ti-currency-rupee', label: 'Total Spent',  value: `₹${(stats?.totalSpent || 0).toLocaleString('en-IN')}`, color: '#534AB7', bg: '#EEEDFE' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <i className={`ti ${card.icon}`} style={{ fontSize: 20, color: card.color }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: 11, color: '#636e72', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Pending payment alert */}
        {stats?.pendingPayment > 0 && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="ti ti-alert-triangle" style={{ color: '#856404', fontSize: 20 }} aria-hidden="true" />
            <div>
              <div style={{ fontWeight: 600, color: '#856404', fontSize: 14 }}>Payment Pending</div>
              <div style={{ fontSize: 12, color: '#856404' }}>You have ₹{stats.pendingPayment.toLocaleString('en-IN')} in pending payments</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', padding: 5, borderRadius: 12, marginBottom: 20, border: '1px solid rgba(0,0,0,0.06)' }}>
          {[
            { id: 'jobs',     label: 'My Jobs',     icon: 'ti-clipboard-list' },
            { id: 'invoices', label: 'My Invoices', icon: 'ti-receipt' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, background: activeTab === tab.id ? '#e17055' : 'transparent', color: activeTab === tab.id ? 'white' : '#636e72', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
              <i className={`ti ${tab.icon}`} aria-hidden="true" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 14 }}>
                <i className="ti ti-clipboard-off" style={{ fontSize: 40, color: '#dfe6e9', display: 'block', marginBottom: 12 }} aria-hidden="true" />
                <div style={{ fontWeight: 600, color: '#636e72', marginBottom: 4 }}>No jobs yet</div>
                <div style={{ fontSize: 13, color: '#aaa' }}>Contact the shop to create a job order</div>
              </div>
            ) : jobs.map(job => {
              const sc = statusColors[job.status] || { bg: '#f0f0f0', color: '#333' };
              const currentStep = statusSteps.indexOf(job.status);
              return (
                <div key={job._id}
                  style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => setSelectedJob(selectedJob?._id === job._id ? null : job)}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14, marginBottom: 2 }}>
                        Job #{job._id.toString().slice(-5).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: '#636e72', textTransform: 'capitalize' }}>
                        {job.jobType} • {new Date(job.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {job.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
                    {statusSteps.map((step, i) => {
                      const done = i <= currentStep;
                      return (
                        <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#00b894' : '#dfe6e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {done && <i className="ti ti-check" style={{ fontSize: 10, color: 'white' }} aria-hidden="true" />}
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < currentStep ? '#00b894' : '#dfe6e9' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', marginBottom: 8 }}>
                    {statusSteps.map(s => <span key={s} style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</span>)}
                  </div>

                  {/* Expanded details */}
                  {selectedJob?._id === job._id && (
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 }}>
                      {job.description && (
                        <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>
                          <i className="ti ti-notes" style={{ marginRight: 6 }} aria-hidden="true" />
                          {job.description}
                        </div>
                      )}
                      {job.worker && (
                        <div style={{ fontSize: 13, color: '#2d3436', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="ti ti-user-check" style={{ color: '#0F6E56' }} aria-hidden="true" />
                          Worker: <strong>{job.worker.name}</strong> — {job.worker.phone}
                        </div>
                      )}
                      {job.totalEstimate > 0 && (
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#185FA5' }}>
                          <i className="ti ti-currency-rupee" aria-hidden="true" />
                          Estimate: ₹{job.totalEstimate.toLocaleString('en-IN')}
                        </div>
                      )}
                      {job.scheduledDate && (
                        <div style={{ fontSize: 13, color: '#636e72', marginTop: 6 }}>
                          <i className="ti ti-calendar" style={{ marginRight: 6 }} aria-hidden="true" />
                          Scheduled: {new Date(job.scheduledDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 14 }}>
                <i className="ti ti-receipt-off" style={{ fontSize: 40, color: '#dfe6e9', display: 'block', marginBottom: 12 }} aria-hidden="true" />
                <div style={{ fontWeight: 600, color: '#636e72' }}>No invoices yet</div>
              </div>
            ) : invoices.map(inv => (
              <div key={inv._id} style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: 12, color: '#636e72', marginTop: 2, textTransform: 'capitalize' }}>
                      {inv.job?.jobType} job • {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <span style={{
                    background: inv.paymentStatus === 'paid' ? '#E1F5EE' : inv.paymentStatus === 'partial' ? '#FAEEDA' : '#FCEBEB',
                    color: inv.paymentStatus === 'paid' ? '#0F6E56' : inv.paymentStatus === 'partial' ? '#854F0B' : '#A32D2D',
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
                  }}>
                    {inv.paymentStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Total', value: `₹${(inv.totalAmount || 0).toLocaleString('en-IN')}`, color: '#185FA5' },
                    { label: 'Paid', value: `₹${(inv.paidAmount || 0).toLocaleString('en-IN')}`, color: '#0F6E56' },
                    { label: 'Due', value: `₹${((inv.totalAmount || 0) - (inv.paidAmount || 0)).toLocaleString('en-IN')}`, color: '#A32D2D' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#636e72', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {inv.paymentStatus !== 'paid' && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff3cd', borderRadius: 8, fontSize: 12, color: '#856404', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-alert-triangle" aria-hidden="true" />
                    Payment pending — Please contact the shop to pay
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact shop */}
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
          <i className="ti ti-phone" style={{ fontSize: 28, color: '#e17055', display: 'block', marginBottom: 8 }} aria-hidden="true" />
          <div style={{ fontWeight: 600, color: 'white', marginBottom: 4 }}>Need Help?</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Contact the shop directly</div>
          <a href="https://wa.me/919876543210"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            <i className="ti ti-brand-whatsapp" aria-hidden="true" /> Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}