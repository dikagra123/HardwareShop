import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('shop');
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
  axios.get(`${API_URL}/api/settings`)
    .then(r => {
      setSettings(r.data);
      // Show logo from Base64 or URL
      if (r.data.logoBase64) setLogoPreview(r.data.logoBase64);
      else if (r.data.logoUrl) setLogoPreview(`${API_URL}${r.data.logoUrl}`);
    })
    .catch(() => setMsg('❌ Failed to load settings'))
    .finally(() => setLoading(false));
}, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await axios.put(`${API_URL}/api/settings`, settings, { headers });
      setMsg('✅ Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

 const handleLogoUpload = async (file) => {
  if (!file) return;
  setUploadingLogo(true);
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target.result.split(',')[1];
      const mimeType = file.type;

      const res = await axios.post(
        `${API_URL}/api/settings/logo`,
        { base64: base64String, mimeType },
        { headers }
      );

      setLogoPreview(res.data.logoBase64);
      setSettings(s => ({ ...s, logoBase64: res.data.logoBase64 }));
      setMsg('✅ Logo saved permanently!');
    };
    reader.readAsDataURL(file);
  } catch (err) {
    setMsg('❌ ' + (err.response?.data?.error || err.message));
  } finally {
    setUploadingLogo(false);
  }
};

  const handleDeleteLogo = async () => {
    if (!window.confirm('Remove shop logo?')) return;
    try {
      await axios.delete(`${API_URL}/api/settings/logo`, { headers });
      setLogoPreview(null);
      setSettings(s => ({ ...s, logoUrl: '' }));
      setMsg('✅ Logo removed');
    } catch {
      setMsg('❌ Failed to remove logo');
    }
  };

  const updateHours = (day, field, value) => {
    setSettings(s => ({
      ...s,
      workingHours: {
        ...s.workingHours,
        [day]: { ...s.workingHours[day], [field]: value }
      }
    }));
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading settings...</p></div>;
  if (!settings) return <div className="alert alert-danger">Failed to load settings</div>;

  const tabs = [
    { id: 'shop',    label: '🏪 Shop Info',      },
    { id: 'logo',    label: '🖼️ Logo',            },
    { id: 'billing', label: '💰 Billing & Tax',   },
    { id: 'hours',   label: '🕐 Working Hours',   },
    { id: 'invoice', label: '🧾 Invoice Settings', },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>
            Manage your shop configuration
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary"
          style={{ padding: '10px 28px', fontSize: 15 }}>
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: 20 }}>
          {msg}
          <button onClick={() => setMsg('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white',
        padding: 6, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 18px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              background: activeTab === tab.id ? '#e17055' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#636e72',
              transition: 'all 0.2s'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Shop Info ─────────────────────────────────── */}
      {activeTab === 'shop' && (
        <div className="card">
          <h2 className="card-title">🏪 Shop Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Shop Name *</label>
              <input className="form-control" value={settings.shopName || ''}
                onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                placeholder="e.g. Sharma Hardware Shop" />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input className="form-control" value={settings.tagline || ''}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="e.g. Your trusted repair partner" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Primary Phone *</label>
              <input className="form-control" value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label>Secondary Phone</label>
              <input className="form-control" value={settings.phone2 || ''}
                onChange={e => setSettings({ ...settings, phone2: e.target.value })}
                placeholder="Alternate number (optional)" />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" value={settings.email || ''}
              onChange={e => setSettings({ ...settings, email: e.target.value })}
              placeholder="shop@example.com" />
          </div>

          <div className="form-group">
            <label>Shop Address</label>
            <textarea className="form-control" rows={2} value={settings.address || ''}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              placeholder="Street address, landmark..." />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>City</label>
              <input className="form-control" value={settings.city || ''}
                onChange={e => setSettings({ ...settings, city: e.target.value })}
                placeholder="e.g. Bhopal" />
            </div>
            <div className="form-group">
              <label>State</label>
              <input className="form-control" value={settings.state || ''}
                onChange={e => setSettings({ ...settings, state: e.target.value })}
                placeholder="e.g. Madhya Pradesh" />
            </div>
            <div className="form-group">
              <label>PIN Code</label>
              <input className="form-control" value={settings.pincode || ''}
                onChange={e => setSettings({ ...settings, pincode: e.target.value })}
                placeholder="6-digit PIN" />
            </div>
          </div>

          <div className="form-group">
            <label>GST Number (optional)</label>
            <input className="form-control" value={settings.gstNumber || ''}
              onChange={e => setSettings({ ...settings, gstNumber: e.target.value })}
              placeholder="e.g. 23AABCU9603R1ZX" style={{ textTransform: 'uppercase' }} />
          </div>

          {/* Preview card */}
          <div style={{ marginTop: 20, padding: 20, background: 'linear-gradient(135deg, #2d3436, #636e72)',
            borderRadius: 12, color: 'white' }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Preview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {logoPreview ? (
                <img src={logoPreview} alt="logo"
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain', background: 'white', padding: 4 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e17055',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏪</div>
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.shopName || 'Your Shop Name'}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{settings.tagline || 'Your tagline here'}</div>
                {settings.phone && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>📞 {settings.phone}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Logo ──────────────────────────────────────── */}
      {activeTab === 'logo' && (
        <div className="card">
          <h2 className="card-title">🖼️ Shop Logo</h2>
          <p style={{ color: '#636e72', fontSize: 14, marginBottom: 20 }}>
            Upload your shop logo. It will appear on invoices and the dashboard. Max 2MB, JPG/PNG/SVG.
          </p>

          {/* Current logo */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#636e72', display: 'block', marginBottom: 10 }}>
              Current Logo
            </label>
            {logoPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 120, height: 120, borderRadius: 12, border: '2px solid #dfe6e9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f8f9fa', overflow: 'hidden', padding: 8 }}>
                  <img src={logoPreview} alt="Shop logo"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#2d3436' }}>
                    ✅ Logo uploaded
                  </div>
                  <button onClick={handleDeleteLogo} className="btn btn-danger btn-sm">
                    🗑️ Remove Logo
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: 12, border: '2px dashed #dfe6e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f8f9fa', fontSize: 36 }}>
                🏪
              </div>
            )}
          </div>

          {/* Upload new logo */}
          <div
            onClick={() => logoRef.current.click()}
            style={{ border: '2px dashed #dfe6e9', borderRadius: 12, padding: '32px 20px',
              textAlign: 'center', cursor: 'pointer', background: '#fafafa',
              transition: 'all 0.2s', marginBottom: 16 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e17055'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#dfe6e9'}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>
              {uploadingLogo ? '⏳' : '📤'}
            </div>
            <div style={{ fontWeight: 600, color: '#2d3436', marginBottom: 4 }}>
              {uploadingLogo ? 'Uploading...' : 'Click to upload logo'}
            </div>
            <div style={{ fontSize: 13, color: '#636e72' }}>
              JPG, PNG, SVG, WEBP • Max 2MB
            </div>
            <input ref={logoRef} type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleLogoUpload(e.target.files[0])} />
          </div>

          <div style={{ padding: 14, background: '#f0f8ff', borderRadius: 8,
            fontSize: 13, color: '#0984e3', border: '1px solid #cce5ff' }}>
            💡 <strong>Tips:</strong> Use a square logo (1:1 ratio) for best results.
            Transparent PNG works best on colored backgrounds.
            Recommended size: 200×200 pixels or larger.
          </div>
        </div>
      )}

      {/* ── TAB: Billing & Tax ─────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="card">
          <h2 className="card-title">💰 Billing & Tax Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Default Tax / GST (%)</label>
              <input className="form-control" type="number" min="0" max="100"
                value={settings.taxPercent || 0}
                onChange={e => setSettings({ ...settings, taxPercent: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 18 for 18% GST" />
              <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>
                This will be auto-applied when generating invoices
              </div>
            </div>
            <div className="form-group">
              <label>Currency Symbol</label>
              <select className="form-control" value={settings.currency || '₹'}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                <option value="₹">₹ Indian Rupee (INR)</option>
                <option value="$">$ US Dollar (USD)</option>
                <option value="€">€ Euro (EUR)</option>
                <option value="£">£ British Pound (GBP)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>GST / PAN Number</label>
            <input className="form-control" value={settings.gstNumber || ''}
              onChange={e => setSettings({ ...settings, gstNumber: e.target.value })}
              placeholder="GST or PAN number for invoices" />
          </div>

          {/* Tax preview */}
          <div style={{ marginTop: 20, padding: 20, background: '#f8f9fa', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              💡 Tax Calculation Preview
            </div>
            {[1000, 5000, 10000].map(amount => {
              const tax = (amount * (settings.taxPercent || 0)) / 100;
              const total = amount + tax;
              return (
                <div key={amount} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #e9ecef', fontSize: 14 }}>
                  <span style={{ color: '#636e72' }}>
                    {settings.currency || '₹'}{amount.toLocaleString('en-IN')} + {settings.taxPercent || 0}% tax
                  </span>
                  <span style={{ fontWeight: 600, color: '#00b894' }}>
                    = {settings.currency || '₹'}{total.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Working Hours ─────────────────────────────── */}
      {activeTab === 'hours' && (
        <div className="card">
          <h2 className="card-title">🕐 Working Hours</h2>
          <p style={{ color: '#636e72', fontSize: 14, marginBottom: 20 }}>
            Set your shop's opening and closing times for each day.
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {DAYS.map(day => {
              const hours = settings.workingHours?.[day] || { open: '09:00', close: '18:00', isOpen: true };
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 16px', background: hours.isOpen ? '#f0fff4' : '#f8f9fa',
                  borderRadius: 10, border: `1px solid ${hours.isOpen ? '#b2dfdb' : '#e9ecef'}`,
                  transition: 'all 0.2s' }}>

                  {/* Toggle */}
                  <div onClick={() => updateHours(day, 'isOpen', !hours.isOpen)}
                    style={{ cursor: 'pointer', userSelect: 'none',
                      width: 44, height: 24, borderRadius: 12,
                      background: hours.isOpen ? '#00b894' : '#dfe6e9',
                      position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2,
                      left: hours.isOpen ? 22 : 2, width: 20, height: 20,
                      borderRadius: '50%', background: 'white',
                      transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>

                  {/* Day name */}
                  <div style={{ width: 100, fontWeight: 600, fontSize: 14,
                    color: hours.isOpen ? '#2d3436' : '#aaa', textTransform: 'capitalize' }}>
                    {day}
                  </div>

                  {hours.isOpen ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <input type="time" className="form-control" value={hours.open}
                          onChange={e => updateHours(day, 'open', e.target.value)}
                          style={{ padding: '7px 12px' }} />
                      </div>
                      <span style={{ color: '#636e72', fontWeight: 500 }}>to</span>
                      <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <input type="time" className="form-control" value={hours.close}
                          onChange={e => updateHours(day, 'close', e.target.value)}
                          style={{ padding: '7px 12px' }} />
                      </div>
                      <div style={{ fontSize: 13, color: '#00b894', fontWeight: 600,
                        minWidth: 60, textAlign: 'right' }}>
                        Open ✅
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, fontSize: 14, color: '#aaa', fontStyle: 'italic' }}>
                      Closed on this day
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hours preview */}
          <div style={{ marginTop: 20, padding: 16, background: '#f8f9fa', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#2d3436' }}>
              📋 Schedule Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DAYS.map(day => {
                const h = settings.workingHours?.[day];
                return (
                  <div key={day} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between',
                    padding: '4px 8px', background: 'white', borderRadius: 6 }}>
                    <span style={{ textTransform: 'capitalize', color: '#636e72' }}>{day}</span>
                    <span style={{ fontWeight: 600, color: h?.isOpen ? '#00b894' : '#d63031' }}>
                      {h?.isOpen ? `${h.open} - ${h.close}` : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Invoice Settings ──────────────────────────── */}
      {activeTab === 'invoice' && (
        <div className="card">
          <h2 className="card-title">🧾 Invoice Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number Prefix</label>
              <input className="form-control" value={settings.invoicePrefix || 'INV'}
                onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value.toUpperCase() })}
                placeholder="e.g. INV, BILL, HSS" style={{ textTransform: 'uppercase' }} />
              <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>
                Preview: <strong>{settings.invoicePrefix || 'INV'}-001, {settings.invoicePrefix || 'INV'}-002...</strong>
              </div>
            </div>
            <div className="form-group">
              <label>Default Payment Terms</label>
              <select className="form-control" value={settings.paymentTerms || 'due_on_completion'}
                onChange={e => setSettings({ ...settings, paymentTerms: e.target.value })}>
                <option value="due_on_completion">Due on Completion</option>
                <option value="due_7_days">Due in 7 Days</option>
                <option value="due_15_days">Due in 15 Days</option>
                <option value="due_30_days">Due in 30 Days</option>
                <option value="advance_50">50% Advance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Invoice Footer / Thank You Note</label>
            <textarea className="form-control" rows={3}
              value={settings.invoiceNotes || ''}
              onChange={e => setSettings({ ...settings, invoiceNotes: e.target.value })}
              placeholder="e.g. Thank you for your business! Payment accepted via Cash, UPI, Bank Transfer." />
          </div>

          <div className="form-group">
            <label>UPI ID (for QR code on invoice)</label>
            <input className="form-control" value={settings.upiId || ''}
              onChange={e => setSettings({ ...settings, upiId: e.target.value })}
              placeholder="e.g. yourname@paytm or 9876543210@upi" />
          </div>

          {/* Invoice preview */}
          <div style={{ marginTop: 20, border: '1px solid #dfe6e9', borderRadius: 12,
            overflow: 'hidden' }}>
            <div style={{ background: '#2d3436', color: 'white', padding: '14px 20px',
              fontSize: 13, fontWeight: 600 }}>
              Invoice Preview
            </div>
            <div style={{ padding: 20, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.shopName || 'HardwareShop'}</div>
                  <div style={{ fontSize: 12, color: '#636e72' }}>{settings.address || 'Shop Address'}</div>
                  <div style={{ fontSize: 12, color: '#636e72' }}>📞 {settings.phone || 'Phone'}</div>
                  {settings.gstNumber && <div style={{ fontSize: 12, color: '#636e72' }}>GST: {settings.gstNumber}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e17055' }}>INVOICE</div>
                  <div style={{ fontSize: 13, color: '#636e72' }}>{settings.invoicePrefix || 'INV'}-001</div>
                  <div style={{ fontSize: 12, color: '#636e72' }}>{new Date().toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={{ borderTop: '2px solid #e17055', paddingTop: 12, fontSize: 12,
                color: '#636e72', fontStyle: 'italic' }}>
                {settings.invoiceNotes || 'Thank you for your business!'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button at bottom */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button onClick={save} disabled={saving} className="btn btn-primary"
          style={{ padding: '12px 40px', fontSize: 15 }}>
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}