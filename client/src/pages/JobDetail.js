import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getJob, updateJobStatus, createInvoice } from '../api';
import DamagePhotos from '../components/DamagePhotos';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const steps = ['pending', 'approved', 'in_progress', 'completed'];

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [notifying, setNotifying] = useState('');

  const load = () => {
    setLoading(true);
    getJob(id)
      .then(r => setJob(r.data))
      .catch(() => setMsg('Failed to load job'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatus = async (status) => {
    try {
      await updateJobStatus(id, { status });
      load();
    } catch { alert('Update failed'); }
  };

  const handleCreateInvoice = async () => {
    if (job.invoice) return alert('Invoice already exists');
    try {
      await createInvoice({ jobId: id, taxPercent: 0 });
      setMsg('✅ Invoice created!');
      load();
    } catch { alert('Failed to create invoice'); }
  };

  // ── WhatsApp notification sender ──────────────────────────────
  const sendNotification = async (type, label) => {
    setNotifying(type);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      let url = '';

      if (type === 'estimate') url = `${API_URL}/api/notify/estimate/${id}`;
      else if (type === 'status') url = `${API_URL}/api/notify/status/${id}`;
      else if (type === 'invoice') url = `${API_URL}/api/notify/invoice/${job.invoice?._id || job.invoice?.id}`;

      const res = await axios.post(url, {}, { headers });

      // Open WhatsApp with pre-filled message
      if (res.data.whatsAppLink) {
        window.open(res.data.whatsAppLink, '_blank');
        setMsg(`✅ WhatsApp opened for "${label}" notification!`);
      }
    } catch (err) {
      // Fallback — build WhatsApp link manually if backend route not found
      const customer = job.customer;
      const phone = customer?.phone || '';
      let message = '';

      if (type === 'estimate') {
        message = `Hello ${customer?.name}! Your estimate from HardwareShop is ready.\nJob ID: ${id}\nEstimated Cost: Rs.${job.totalEstimate || 0}\nThank you!`;
      } else if (type === 'status') {
        message = `Hello ${customer?.name}! Your job status has been updated to: ${job.status.replace('_', ' ').toUpperCase()}.\nJob ID: ${id}\nThank you - HardwareShop`;
      } else if (type === 'invoice') {
        message = `Hello ${customer?.name}! Your invoice has been generated.\nJob ID: ${id}\nAmount: Rs.${job.totalEstimate || 0}\nPlease contact us for payment. Thank you!`;
      }

      const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
      const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const whatsAppLink = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
      window.open(whatsAppLink, '_blank');
      setMsg(`✅ WhatsApp opened for "${label}" notification!`);
    } finally {
      setNotifying('');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading job details...</p></div>;
  if (!job) return <div className="alert alert-danger">Job not found</div>;

  const currentStep = steps.indexOf(job.status);
  const customerName = job.customer?.name || 'Customer';
  const customerPhone = job.customer?.phone || '';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link to="/jobs" style={{ color: '#636e72', fontSize: 14 }}>← Back to Jobs</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            Job #{id.slice(-5).toUpperCase()}
          </h1>
          <div style={{ fontSize: 13, color: '#636e72', marginTop: 2 }}>
            Customer: <strong>{customerName}</strong> • {customerPhone}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!job.invoice && job.totalEstimate > 0 && (
            <button onClick={handleCreateInvoice} className="btn btn-success">
              📄 Create Invoice
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: 16 }}>
          {msg}
          <button onClick={() => setMsg('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Progress tracker */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title">📊 Job Progress</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div onClick={() => handleStatus(step)} style={{
                    width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                    background: done ? '#00b894' : '#dfe6e9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? 'white' : '#636e72', fontWeight: 700, fontSize: 15,
                    border: active ? '3px solid #00b894' : '3px solid transparent',
                    transition: 'all 0.2s', boxShadow: active ? '0 0 0 4px rgba(0,184,148,0.2)' : 'none'
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 6, color: done ? '#00b894' : '#636e72',
                    fontWeight: active ? 700 : 400, textTransform: 'capitalize', textAlign: 'center' }}>
                    {step.replace('_', ' ')}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ height: 3, flex: 1, marginBottom: 18,
                    background: i < currentStep ? '#00b894' : '#dfe6e9', borderRadius: 2 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer + Financial info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h2 className="card-title">👤 Customer Details</h2>
          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              {[
                ['Name', customerName],
                ['Phone', customerPhone],
                ['Email', job.customer?.email || '—'],
                ['Job Type', job.jobType],
                ['Worker', job.worker?.name || 'Not assigned'],
                ['Scheduled', job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-IN') : '—'],
                ['Created', new Date(job.createdAt).toLocaleDateString('en-IN')],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: '#636e72', padding: '6px 0', width: 110, fontSize: 12 }}>{k}</td>
                  <td style={{ fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {job.description && (
            <div style={{ marginTop: 12, padding: 10, background: '#f8f9fa', borderRadius: 8, fontSize: 13 }}>
              <strong>Description:</strong> {job.description}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">💰 Financial Summary</h2>
          <div style={{ fontSize: 14 }}>
            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#636e72', marginBottom: 4 }}>Total Estimate</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0984e3' }}>
                ₹{(job.totalEstimate || 0).toLocaleString('en-IN')}
              </div>
            </div>
            {job.invoice ? (
              <>
                {[
                  ['Invoice #', job.invoice.invoiceNumber],
                  ['Subtotal', `₹${parseFloat(job.invoice.subtotal || 0).toLocaleString('en-IN')}`],
                  ['Total Amount', `₹${parseFloat(job.invoice.totalAmount || 0).toLocaleString('en-IN')}`],
                  ['Amount Paid', `₹${parseFloat(job.invoice.paidAmount || 0).toLocaleString('en-IN')}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8f9fa' }}>
                    <span style={{ color: '#636e72', fontSize: 13 }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4 }}>
                  <span style={{ color: '#636e72', fontSize: 13 }}>Payment Status</span>
                  <span className={`badge badge-${job.invoice.paymentStatus}`}>
                    {job.invoice.paymentStatus}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, color: '#636e72', fontSize: 13 }}>
                No invoice yet.
                {job.totalEstimate > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={handleCreateInvoice} className="btn btn-success btn-sm">
                      📄 Generate Invoice
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── WHATSAPP NOTIFICATIONS ─────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20, border: '2px solid #25D366' }}>
        <h2 className="card-title" style={{ color: '#25D366' }}>
          📲 WhatsApp Notifications
        </h2>
        <p style={{ fontSize: 13, color: '#636e72', marginBottom: 16 }}>
          Send instant WhatsApp message to <strong>{customerName}</strong>
          {customerPhone && <span> ({customerPhone})</span>}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {/* Estimate Ready */}
          <button
            onClick={() => sendNotification('estimate', 'Estimate Ready')}
            disabled={notifying === 'estimate'}
            style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 8,
              padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, opacity: notifying === 'estimate' ? 0.7 : 1 }}>
            {notifying === 'estimate' ? '⏳' : '💰'} Estimate Ready
          </button>

          {/* Status Update */}
          <button
            onClick={() => sendNotification('status', 'Status Update')}
            disabled={notifying === 'status'}
            style={{ background: '#0984e3', color: 'white', border: 'none', borderRadius: 8,
              padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, opacity: notifying === 'status' ? 0.7 : 1 }}>
            {notifying === 'status' ? '⏳' : '🔄'} Status Update
          </button>

          {/* Invoice Generated */}
          {job.invoice && (
            <button
              onClick={() => sendNotification('invoice', 'Invoice Generated')}
              disabled={notifying === 'invoice'}
              style={{ background: '#6c5ce7', color: 'white', border: 'none', borderRadius: 8,
                padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6, opacity: notifying === 'invoice' ? 0.7 : 1 }}>
              {notifying === 'invoice' ? '⏳' : '🧾'} Invoice Generated
            </button>
          )}

          {/* Custom WhatsApp */}
          <button
            onClick={() => {
              const customMsg = prompt('Enter custom message to send:', `Hello ${customerName}! This is HardwareShop.`);
              if (customMsg && customerPhone) {
                const clean = customerPhone.replace(/[\s\-\+\(\)]/g, '');
                const phone = clean.startsWith('91') ? clean : `91${clean}`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(customMsg)}`, '_blank');
              }
            }}
            style={{ background: '#f8f9fa', color: '#2d3436', border: '1.5px solid #dfe6e9',
              borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            ✏️ Custom Message
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#636e72', background: '#f0fff4',
          padding: '8px 12px', borderRadius: 8, border: '1px solid #b2dfdb' }}>
          💡 Clicking any button opens <strong>WhatsApp</strong> with a pre-filled message. Just press <strong>Send</strong>!
        </div>
      </div>

      {/* Paint estimates */}
      {job.paintEstimates?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="card-title">🎨 Paint Estimates</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Room</th><th>Dimensions (ft)</th><th>Paint</th><th>Coats</th><th>Liters</th><th>Paint Cost</th><th>Labour</th><th>Total</th></tr>
              </thead>
              <tbody>
                {job.paintEstimates.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.roomName}</td>
                    <td>{p.length}×{p.width}×{p.height}</td>
                    <td>{p.brand}</td>
                    <td>{p.numCoats}</td>
                    <td>{p.litersNeeded} L</td>
                    <td>₹{parseFloat(p.paintCost).toLocaleString('en-IN')}</td>
                    <td>₹{parseFloat(p.laborCost).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#0984e3' }}>₹{parseFloat(p.totalCost).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Repair items */}
      {job.repairItems?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="card-title">🔧 Repair Items</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Description</th><th>Qty</th><th>Labour</th><th>Material</th><th>Total</th></tr>
              </thead>
              <tbody>
                {job.repairItems.map((r, i) => (
                  <tr key={i}>
                    <td style={{ textTransform: 'capitalize' }}>{r.itemType?.replace('_', ' ')}</td>
                    <td>{r.description || '—'}</td>
                    <td>{r.quantity}</td>
                    <td>₹{parseFloat(r.laborCost).toLocaleString('en-IN')}</td>
                    <td>₹{parseFloat(r.materialCost).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(r.totalCost).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DAMAGE PHOTOS ──────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20, border: '2px solid #e17055' }}>
        <DamagePhotos jobId={id} />
      </div>

    </div>
  );
}