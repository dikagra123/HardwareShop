import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const nav = [
  { path: '/',                     label: 'Dashboard',        icon: 'ti-layout-dashboard' },
  { path: '/customers',            label: 'Customers',        icon: 'ti-users' },
  { path: '/jobs',                 label: 'Job Orders',       icon: 'ti-clipboard-list' },
  { path: '/paint-estimator',      label: 'Paint Estimator',  icon: 'ti-paint' },
  { path: '/repair-estimator',     label: 'Repair Estimator', icon: 'ti-tool' },
  { path: '/inventory',            label: 'Inventory',        icon: 'ti-package' },
  { path: '/invoices',             label: 'Invoices',         icon: 'ti-receipt' },
  { path: '/charts',               label: 'Analytics',        icon: 'ti-chart-bar' },
  { path: '/paint-recommendation', label: 'Paint Guide',      icon: 'ti-bulb' },
  { path: '/settings',             label: 'Settings',         icon: 'ti-settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [shopName, setShopName] = useState('Hardware Repair Shop');

 useEffect(() => {
  axios.get(`${API_URL}/api/settings`)
    .then(r => {
      // Use Base64 logo (permanent) or URL logo
      if (r.data.logoBase64) setLogoUrl(r.data.logoBase64);
      else if (r.data.logoUrl) setLogoUrl(`${API_URL}${r.data.logoUrl}`);
      if (r.data.shopName) setShopName(r.data.shopName);
    })
    .catch(() => {});
}, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: 240,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 999,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        overflowY: 'auto',
      }}>

        {/* Logo section */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo image or default icon */}
            <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo"
                  style={{ width: 38, height: 38, objectFit: 'contain', background: 'white', padding: 4, borderRadius: 10 }} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#e17055,#d63031)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-building-store" style={{ color: 'white', fontSize: 18 }} aria-hidden="true" />
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{shopName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}> Repair & Paint Estimator System</div>
            </div>
          </div>

          {/* Close button mobile */}
          <button onClick={closeSidebar}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20, padding: 4 }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', padding: '0 8px', marginBottom: 6, letterSpacing: 1 }}>
            MAIN MENU
          </div>
          {nav.map(({ path, label, icon }) => (
            <NavLink key={path} to={path} end={path === '/'}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9,
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                textDecoration: 'none', fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                marginBottom: 2,
                transition: 'all 0.18s',
                borderRight: isActive ? '3px solid #e17055' : '3px solid transparent',
              })}>
              <i className={`ti ${icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e17055,#d63031)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <i className="ti ti-logout" aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .sidebar { transform: translateX(0) !important; }
          .main-content { margin-left: 240px !important; }
          .mobile-topbar-menu { display: none !important; }
        }
        @media (max-width: 767px) {
          .main-content { margin-left: 0 !important; }
        }
      `}</style>

      {/* Main content */}
      <main className="main-content" style={{
        flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf0ff 50%, #f0fff8 100%)'
      }}>

        {/* Top bar */}
        <div style={{ background: 'white', padding: '12px 20px', borderBottom: '1px solid #dfe6e9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          {/* Hamburger - mobile only */}
          <button className="mobile-topbar-menu"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#2d3436', padding: 4, display: 'flex', alignItems: 'center' }}>
            <i className="ti ti-menu-2" aria-hidden="true" />
          </button>

          <div style={{ fontSize: 14, color: '#636e72' }}>
            Welcome back, <strong>{user?.name}</strong>
          </div>
          <div style={{ fontSize: 12, color: '#636e72' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '20px 16px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}