import { useState, useEffect } from 'react';
import { getInvoices, payInvoice } from '../api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getInvoices().then(r => setInvoices(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id, total) => {
    const amount = prompt(`Enter amount paid (Total: ₹${total}):`, total);
    if (!amount) return;
    const method = prompt('Payment method? (cash/upi/bank):', 'upi');
    try {
      await payInvoice(id, { paidAmount: parseFloat(amount), paymentMethod: method });
      load();
    } catch { alert('Payment update failed'); }
  };

  const summary = {
    total: invoices.length,
    paid: invoices.filter(i => i.payment_status === 'paid').length,
    unpaid: invoices.filter(i => i.payment_status === 'unpaid').length,
    revenue: invoices.filter(i => i.payment_status === 'paid').reduce((s, i) => s + parseFloat(i.paid_amount), 0),
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💰 Invoices</h1>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Invoices', value: summary.total, icon: '📄' },
          { label: 'Paid', value: summary.paid, icon: '✅' },
          { label: 'Unpaid', value: summary.unpaid, icon: '⏳' },
          { label: 'Revenue Collected', value: `₹${summary.revenue.toLocaleString('en-IN')}`, icon: '💵' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="icon">{s.icon}</div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Job Type</th><th>Total</th><th>Paid</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#636e72' }}>No invoices yet</td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: '#0984e3' }}>{inv.invoice_number}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inv.customer_name}</div>
                      <div style={{ fontSize: 12, color: '#636e72' }}>{inv.customer_phone}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{inv.job_type}</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</td>
                    <td>₹{parseFloat(inv.paid_amount).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${inv.payment_status}`}>{inv.payment_status}</span></td>
                    <td style={{ fontSize: 13, color: '#636e72' }}>{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      {inv.payment_status !== 'paid' && (
                        <button onClick={() => handlePay(inv.id, inv.total_amount)} className="btn btn-success btn-sm">
                          💳 Mark Paid
                        </button>
                      )}
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