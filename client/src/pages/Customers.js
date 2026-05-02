import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = (q) => {
    setLoading(true);
    getCustomers(q).then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(''); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._st);
    window._st = setTimeout(() => load(e.target.value), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCustomer(form);
      setMsg('Customer added successfully!');
      setForm({ name: '', phone: '', email: '', address: '' });
      setShowForm(false);
      load('');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error saving customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      load('');
    } catch {
      alert('Cannot delete customer with existing jobs.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Customers</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-danger'}`}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="card-title">New Customer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" value={form.name} required
                  onChange={e => setForm({...form, name: e.target.value})} placeholder="Customer name" />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input className="form-control" value={form.phone} required
                  onChange={e => setForm({...form, phone: e.target.value})} placeholder="10-digit phone" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email (optional)</label>
                <input className="form-control" type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '✓ Save Customer'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <input className="form-control" value={search} onChange={handleSearch}
            placeholder="🔍 Search by name or phone..." style={{ maxWidth: 360 }} />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading...</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Since</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#636e72' }}>No customers found</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: '#0984e3', fontWeight: 600 }}>{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td><a href={`tel:${c.phone}`} style={{ color: '#00b894' }}>{c.phone}</a></td>
                    <td>{c.email || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button onClick={() => handleDelete(c.id, c.name)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}