import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useState } from 'react';

const nav = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/jobs', label: 'Job Orders', icon: '📋' },
  { path: '/paint-estimator', label: 'Paint Estimator', icon: '🎨' },
  { path: '/repair-estimator', label: 'Repair Estimator', icon: '🔧' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/invoices', label: 'Invoices', icon: '💰' },
  { path: '/charts', label: 'Analytics', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'none' }}
          className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#2d3436', color: 'white', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e17055' }}>🏪 HardwareShop</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Repair & Paint Estimator</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {nav.map(({ path, label, icon }) => (
            <NavLink key={path} to={path} end={path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', color: isActive ? '#e17055' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(225,112,85,0.15)' : 'transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                borderRight: isActive ? '3px solid #e17055' : '3px solid transparent',
                transition: 'all 0.15s'
              })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
            👤 {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            {user?.role?.toUpperCase()}
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
              color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: 'white', padding: '14px 28px', borderBottom: '1px solid #dfe6e9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, color: '#636e72' }}>Welcome back, <strong>{user?.name}</strong> 👋</div>
          <div style={{ fontSize: 13, color: '#636e72' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        {/* Page content */}
        <div style={{ padding: 28 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}