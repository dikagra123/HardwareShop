import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@hardwareshop.com', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '40px 36px', width: '100%',
        maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2d3436' }}>HardwareShop</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>Repair & Paint Management System</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}>
            {loading ? 'Signing in...' : '🔑 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 14, background: '#f8f9fa', borderRadius: 8, fontSize: 12, color: '#636e72' }}>
          <strong>Demo Login:</strong><br />
          Email: admin@hardwareshop.com<br />
          Password: admin123
        </div>
      </div>
    </div>
  );
}