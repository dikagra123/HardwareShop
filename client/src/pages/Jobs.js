import { useState, useEffect } from 'react';
import { getJobs, updateJobStatus, createJob, getCustomers } from '../api';
import { Link } from 'react-router-dom';

const statusColors = {
  pending: '#fdcb6e',
  approved: '#74b9ff',
  in_progress: '#0984e3',
  completed: '#00b894',
  cancelled: '#d63031'
};
const statuses = ['pending', 'approved', 'in_progress', 'completed', 'cancelled'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    customerId: '',
    jobType: 'repair',
    description: '',
    address: '',
    scheduledDate: '',
    notes: ''
  });

  const load = (status) => {
    setLoading(true);
    getJobs(status ? { status } : {})
      .then(r => setJobs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load('');
    getCustomers('').then(r => setCustomers(r.data));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateJobStatus(id, { status });
      load(filter);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!form.customerId) { setMsg('Please select a customer'); return; }
    setSaving(true);
    try {
      await createJob(form);
      setMsg('✅ Job created successfully!');
      setForm({ customerId: '', jobType: 'repair', description: '', address: '', scheduledDate: '', notes: '' });
      setShowForm(false);
      load(filter);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to create job'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Job Orders</h1>
        <button onClick={() => { setShowForm(!showForm); setMsg(''); }}
          className="btn btn-primary">
          {showForm ? '✕ Cancel' : '+ Create New Job'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
          {msg}
        </div>
      )}

      {/* Create Job Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #e17055' }}>
          <h2 className="card-title">🆕 Create New Job Order</h2>
          <form onSubmit={handleCreateJob}>
            <div className="form-row">
              <div className="form-group">
                <label>Customer *</label>
                <select className="form-control" value={form.customerId} required
                  onChange={e => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <div style={{ fontSize: 12, color: '#e17055', marginTop: 4 }}>
                    No customers found. <Link to="/customers">Add a customer first →</Link>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Job Type *</label>
                <select className="form-control" value={form.jobType}
                  onChange={e => setForm({ ...form, jobType: e.target.value })}>
                  <option value="repair">🔧 Repair</option>
                  <option value="paint">🎨 Paint</option>
                  <option value="both">🔧🎨 Both (Repair + Paint)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the work needed e.g. Wall crack in living room, needs repair and repainting..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Work Address</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Address where work will be done" />
              </div>
              <div className="form-group">
                <label>Scheduled Date</label>
                <input className="form-control" type="date" value={form.scheduledDate}
                  onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <input className="form-control" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or notes..." />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Creating...' : '✅ Create Job Order'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...statuses].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s); }}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}>
            {s ? s.replace('_', ' ').toUpperCase() : 'ALL'}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading jobs...</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>No jobs found</div>
                      <div style={{ fontSize: 13 }}>Click "+ Create New Job" to add your first job order</div>
                    </td>
                  </tr>
                ) : jobs.map(job => (
                  <tr key={job._id || job.id}>
                    <td>
                      <Link to={`/jobs/${job._id || job.id}`}
                        style={{ color: '#0984e3', fontWeight: 700 }}>
                        #{(job._id || job.id).toString().slice(-5).toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {job.customer?.name || job.customer_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#636e72' }}>
                        {job.customer?.phone || job.customer_phone}
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {job.jobType === 'repair' ? '🔧' : job.jobType === 'paint' ? '🎨' : '🔧🎨'} {job.jobType}
                      </span>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#636e72' }}>
                      {job.description || '—'}
                    </td>
                    <td>{job.worker?.name || job.worker_name || <span style={{ color: '#aaa', fontSize: 12 }}>Unassigned</span>}</td>
                    <td>
                      <select value={job.status}
                        onChange={e => handleStatusChange(job._id || job.id, e.target.value)}
                        style={{
                          border: 'none',
                          background: `${statusColors[job.status]}33`,
                          color: statusColors[job.status],
                          fontWeight: 600, borderRadius: 6,
                          padding: '4px 8px', cursor: 'pointer', fontSize: 12
                        }}>
                        {statuses.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0984e3' }}>
                      {job.totalEstimate
                        ? `₹${parseFloat(job.totalEstimate).toLocaleString('en-IN')}`
                        : <span style={{ color: '#aaa', fontSize: 12 }}>Not set</span>}
                    </td>
                    <td style={{ fontSize: 12, color: '#636e72' }}>
                      {new Date(job.createdAt || job.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <Link to={`/jobs/${job._id || job.id}`}
                        className="btn btn-outline btn-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {jobs.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {statuses.map(s => {
            const count = jobs.filter(j => j.status === s).length;
            if (count === 0) return null;
            return (
              <div key={s} style={{ fontSize: 13, color: statusColors[s], fontWeight: 600 }}>
                {s.replace('_', ' ')}: {count}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}