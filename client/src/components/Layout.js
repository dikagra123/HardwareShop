import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useState } from 'react';

const nav = [
  { path: '/', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { path: '/customers', label: 'Customers', icon: 'ti-users' },
  { path: '/jobs', label: 'Job Orders', icon: 'ti-clipboard' },
  { path: '/paint-estimator', label: 'Paint Estimator', icon: 'ti-paint' },
  { path: '/repair-estimator', label: 'Repair Estimator', icon: 'ti-tool' },
  { path: '/inventory', label: 'Inventory', icon: 'ti-package' },
  { path: '/invoices', label: 'Invoices', icon: 'ti-receipt' },
  { path: '/charts', label: 'Analytics', icon: 'ti-chart-bar' },
  { path: '/settings', label: 'Settings', icon: 'ti-settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f4f6f9'
    }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 260,
        background: 'linear-gradient(180deg, #0f172a, #111827)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        padding: '20px 0'
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 10
        }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            🏪 HardwareShop
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            Paint & Repair System
          </div>
        </div>

        {/* NAV */}
        <nav style={{
          flex: 1,
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          {nav.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                margin: '0 10px',
                borderRadius: 10,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(225,112,85,0.15)' : 'transparent',
                borderLeft: isActive ? '4px solid #e17055' : '4px solid transparent',
                transition: '0.2s'
              })}
            >
              <i className={`ti ${icon}`} style={{ fontSize: 18 }} />
              <span style={{ fontSize: 14 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* USER */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: 13 }}>{user?.name}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {user?.role?.toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 10,
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.08)',
              color: 'white'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        marginLeft: 260,
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        padding: '24px',
        boxSizing: 'border-box'
       
      }}>

        <div style={{
          background: '#ffffff7a',
          borderRadius: 12,
          minHeight: 'calc(100vh - 48px)',
          padding: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
}