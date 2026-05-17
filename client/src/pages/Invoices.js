import { useState, useEffect } from 'react';
import { getInvoices, payInvoice } from '../api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    getInvoices()
      .then(r => {
        console.log('Invoices data:', r.data);
        setInvoices(r.data);
      })
      .catch(err => {
        console.error('Invoice error:', err);
        setMsg('❌ Failed to load invoices');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (inv) => {
    const amount = prompt(
      `Enter amount paid:\nTotal: ₹${parseFloat(inv.totalAmount || inv.total_amount || 0).toLocaleString('en-IN')}`,
      inv.totalAmount || inv.total_amount
    );
    if (!amount) return;

    const method = prompt('Payment method?\nType: cash / upi / bank', 'cash');
    if (!method) return;

    try {
      await payInvoice(inv._id || inv.id, {
        paidAmount: parseFloat(amount),
        paymentMethod: method
      });
      setMsg('✅ Payment recorded successfully!');
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Payment update failed'));
    }
  };

  const summary = {
    total: invoices.length,
    paid: invoices.filter(i => (i.paymentStatus || i.payment_status) === 'paid').length,
    unpaid: invoices.filter(i => (i.paymentStatus || i.payment_status) === 'unpaid').length,
    revenue: invoices
      .filter(i => (i.paymentStatus || i.payment_status) === 'paid')
      .reduce((s, i) => s + parseFloat(i.paidAmount || i.paid_amount || 0), 0),
  };

  const getStatus = (inv) => inv.paymentStatus || inv.payment_status || 'unpaid';
  const getTotal = (inv) => parseFloat(inv.totalAmount || inv.total_amount || 0);
  const getPaid = (inv) => parseFloat(inv.paidAmount || inv.paid_amount || 0);
  const getCustomerName = (inv) => {
    if (inv.job?.customer?.name) return inv.job.customer.name;
    if (inv.customer_name) return inv.customer_name;
    return 'Customer';
  };
  const getJobType = (inv) => inv.job?.jobType || inv.job?.job_type || inv.job_type || '—';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💰 Invoices</h1>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: 16 }}>
          {msg}
          <button onClick={() => setMsg('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: '📄', label: 'Total Invoices', value: summary.total },
          { icon: '✅', label: 'Paid',           value: summary.paid },
          { icon: '⏳', label: 'Unpaid',         value: summary.unpaid },
          { icon: '💵', label: 'Revenue Collected', value: `₹${summary.revenue.toLocaleString('en-IN')}` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="icon">{s.icon}</div>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading invoices...</p></div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No invoices yet</div>
            <div style={{ fontSize: 13 }}>
              Go to <strong>Job Orders → View any job → Click "Generate Invoice"</strong>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Job Type</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const status = getStatus(inv);
                  const total = getTotal(inv);
                  const paid = getPaid(inv);
                  const pending = total - paid;
                  return (
                    <tr key={inv._id || inv.id}>
                      <td style={{ fontWeight: 600, color: '#0984e3' }}>
                        {inv.invoiceNumber || inv.invoice_number}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {getCustomerName(inv)}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {getJobType(inv)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td style={{ color: '#00b894', fontWeight: 600 }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td style={{ color: pending > 0 ? '#d63031' : '#00b894', fontWeight: 600 }}>
                        ₹{pending.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge badge-${status}`}>
                          {status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#636e72' }}>
                        {new Date(inv.createdAt || inv.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        {status !== 'paid' && (
                          <button
                            onClick={() => handlePay(inv)}
                            className="btn btn-success btn-sm">
                            💳 Mark Paid
                          </button>
                        )}
                        {status === 'paid' && (
                          <span style={{ color: '#00b894', fontSize: 13, fontWeight: 600 }}>
                            ✅ Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}