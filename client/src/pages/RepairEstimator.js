import { useState, useEffect } from 'react';
import { calculateRepair, getRepairRates } from '../api';

const repairLabels = {
  wall_crack: { label: 'Wall Crack Repair', icon: '🧱' },
  wall_patch: { label: 'Wall Patch/Plaster', icon: '🔲' },
  furniture_polish: { label: 'Furniture Polish', icon: '🪑' },
  furniture_repair: { label: 'Furniture Repair', icon: '🔨' },
  door_fix: { label: 'Door Fix/Alignment', icon: '🚪' },
  window_fix: { label: 'Window Repair', icon: '🪟' },
  pipe_repair: { label: 'Pipe/Plumbing Repair', icon: '🔧' },
  ceiling_repair: { label: 'Ceiling Repair', icon: '⬆️' },
  floor_repair: { label: 'Floor Repair', icon: '⬇️' },
  electrical_minor: { label: 'Minor Electrical Work', icon: '⚡' },
};

export default function RepairEstimator() {
  const [items, setItems] = useState([
    { repairType: 'wall_crack', quantity: 1, urgency: 'normal', description: '' }
  ]);
  const [rates, setRates] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    getRepairRates().then(r => setRates(r.data)).catch(() => {});
  }, []);

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
    setCalculated(false);
  };

  const addItem = () => setItems([...items, { repairType: 'wall_crack', quantity: 1, urgency: 'normal', description: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const calculate = async () => {
    setError(''); setLoading(true);
    try {
      const promises = items.map(item => calculateRepair(item));
      const responses = await Promise.all(promises);
      setResults(responses.map(r => r.data));
      setCalculated(true);
    } catch {
      setError('Calculation failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = results.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔧 Repair Estimator</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>Get instant cost estimates for repair jobs</p>
        </div>
        <button onClick={addItem} className="btn btn-primary">+ Add Repair Item</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Rate reference card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ fontSize: 14, color: '#636e72' }}>📌 Standard Rates Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {Object.entries(rates).map(([key, rate]) => (
            <div key={key} style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{repairLabels[key]?.icon} {repairLabels[key]?.label}</div>
              <div style={{ color: '#636e72' }}>Labour: ₹{rate.labor} | Material: ₹{rate.material}</div>
              <div style={{ color: '#0984e3', fontSize: 11 }}>{rate.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: '#0984e3', color: 'white', borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {idx + 1}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Repair Item {idx + 1}</h3>
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="btn btn-danger btn-sm">✕</button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Repair Type</label>
                <select className="form-control" value={item.repairType}
                  onChange={e => updateItem(idx, 'repairType', e.target.value)}>
                  {Object.entries(repairLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity / Count</label>
                <input className="form-control" type="number" min="1" value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Urgency</label>
                <select className="form-control" value={item.urgency}
                  onChange={e => updateItem(idx, 'urgency', e.target.value)}>
                  <option value="normal">Normal (Standard Rate)</option>
                  <option value="urgent">Urgent (+50% charge)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input className="form-control" value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)}
                  placeholder="Brief description of the repair..." />
              </div>
            </div>

            {calculated && results[idx] && (
              <div style={{ background: '#f0f8ff', borderRadius: 8, padding: 14, border: '1px solid #cce5ff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72' }}>Labour Cost</div>
                    <div style={{ fontWeight: 700, color: '#0984e3', fontSize: 18 }}>₹{results[idx].laborCost.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72' }}>Material Cost</div>
                    <div style={{ fontWeight: 700, color: '#e17055', fontSize: 18 }}>₹{results[idx].materialCost.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72' }}>Total</div>
                    <div style={{ fontWeight: 700, color: '#00b894', fontSize: 18 }}>₹{results[idx].totalCost.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                {item.urgency === 'urgent' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#856404', background: '#fff3cd', padding: '4px 10px', borderRadius: 4 }}>
                    ⚡ Urgent surcharge (50%) applied
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={calculate} className="btn btn-secondary" disabled={loading}
          style={{ padding: '14px 40px', fontSize: 16 }}>
          {loading ? '⏳ Calculating...' : '🔍 Calculate Repair Cost'}
        </button>
      </div>

      {calculated && results.length > 0 && (
        <div className="estimate-result" style={{ background: 'linear-gradient(135deg, #0984e3, #6c5ce7)', marginTop: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14 }}>Total Repair Estimate</h3>
            <div className="amount">₹{totalCost.toLocaleString('en-IN')}</div>
          </div>
          {results.map((r, i) => (
            <div key={i} className="estimate-row">
              <span>{repairLabels[items[i].repairType]?.label} × {items[i].quantity}</span>
              <span>₹{r.totalCost.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={() => window.print()}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              🖨️ Print Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}