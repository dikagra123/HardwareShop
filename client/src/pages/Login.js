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
    setError('');
    setLoading(true);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #e17055, #d63031)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="ti ti-building-store"
              style={{ fontSize: 32, color: 'white' }}
              aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>
            HardwareShop
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>
            Repair & Paint Management System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(214,48,49,0.2)', border: '1px solid rgba(214,48,49,0.4)',
            borderRadius: 10, padding: '10px 14px', fontSize: 14,
            color: '#ff7675', marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14, color: 'white',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14, color: 'white',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #e17055, #d63031)',
            border: 'none', borderRadius: 10,
            color: 'white', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 20, padding: 14,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, fontSize: 12,
          color: 'rgba(255,255,255,0.4)'
        }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Demo Login:</strong><br />
          Email: admin@hardwareshop.com<br />
          Password: admin123
        </div>
      </div>
    </div>
  );
}

<div style={{ textAlign: 'center', marginTop: 16 }}>
  <a href="/customer/login"
    style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>
    Are you a customer? → Customer Login
  </a>
</div>