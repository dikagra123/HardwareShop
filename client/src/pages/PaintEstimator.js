import { useState } from 'react';
import { calculatePaint } from '../api';

const paintBrands = [
  { name: 'Asian Paints Emulsion Interior', price: 280 },
  { name: 'Berger Easy Clean Interior', price: 260 },
  { name: 'Nerolac Excel Total', price: 310 },
  { name: 'Asian Paints Exterior', price: 320 },
  { name: 'Berger Weathercoat Exterior', price: 340 },
  { name: 'Asian Paints Primer', price: 180 },
];

const finishTypes = ['Matte', 'Satin', 'Eggshell', 'Semi-Gloss', 'Glossy'];

export default function PaintEstimator() {
  const [rooms, setRooms] = useState([
    { roomName: 'Living Room', length: '', width: '', height: '', numDoors: 1, numWindows: 2, numCoats: 2, brand: 'Asian Paints Emulsion Interior', finishType: 'Matte' }
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculated, setCalculated] = useState(false);

  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx] = { ...updated[idx], [field]: value };
    setRooms(updated);
  };

  const addRoom = () => setRooms([...rooms, {
    roomName: `Room ${rooms.length + 1}`, length: '', width: '', height: '',
    numDoors: 1, numWindows: 1, numCoats: 2, brand: 'Asian Paints Emulsion Interior', finishType: 'Matte'
  }]);

  const removeRoom = (idx) => setRooms(rooms.filter((_, i) => i !== idx));

  const calculate = async () => {
    for (const r of rooms) {
      if (!r.length || !r.width || !r.height) {
        setError('Please fill in all room dimensions.');
        return;
      }
    }
    setError(''); setLoading(true);
    try {
      const promises = rooms.map(r => calculatePaint({
        length: r.length, width: r.width, height: r.height,
        numDoors: r.numDoors, numWindows: r.numWindows,
        numCoats: r.numCoats, brand: r.brand, paintType: r.finishType
      }));
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
  const totalLiters = results.reduce((sum, r) => sum + (r.litersNeeded || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎨 Paint Estimator</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>Calculate paint quantity and cost for your project</p>
        </div>
        <button onClick={addRoom} className="btn btn-primary">+ Add Room</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gap: 20 }}>
        {rooms.map((room, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: '#e17055', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{idx + 1}</span>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Room Details</h3>
              </div>
              {rooms.length > 1 && (
                <button onClick={() => removeRoom(idx)} className="btn btn-danger btn-sm">✕ Remove</button>
              )}
            </div>

            <div className="form-group">
              <label>Room Name</label>
              <input className="form-control" value={room.roomName}
                onChange={e => updateRoom(idx, 'roomName', e.target.value)} placeholder="e.g. Living Room" />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Length (feet)</label>
                <input className="form-control" type="number" value={room.length}
                  onChange={e => updateRoom(idx, 'length', e.target.value)} placeholder="e.g. 15" />
              </div>
              <div className="form-group">
                <label>Width (feet)</label>
                <input className="form-control" type="number" value={room.width}
                  onChange={e => updateRoom(idx, 'width', e.target.value)} placeholder="e.g. 12" />
              </div>
              <div className="form-group">
                <label>Height (feet)</label>
                <input className="form-control" type="number" value={room.height}
                  onChange={e => updateRoom(idx, 'height', e.target.value)} placeholder="e.g. 10" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Number of Doors</label>
                <input className="form-control" type="number" min="0" value={room.numDoors}
                  onChange={e => updateRoom(idx, 'numDoors', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Number of Windows</label>
                <input className="form-control" type="number" min="0" value={room.numWindows}
                  onChange={e => updateRoom(idx, 'numWindows', e.target.value)} />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Paint Brand</label>
                <select className="form-control" value={room.brand}
                  onChange={e => updateRoom(idx, 'brand', e.target.value)}>
                  {paintBrands.map(b => <option key={b.name} value={b.name}>{b.name} — ₹{b.price}/L</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Finish Type</label>
                <select className="form-control" value={room.finishType}
                  onChange={e => updateRoom(idx, 'finishType', e.target.value)}>
                  {finishTypes.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Number of Coats</label>
                <select className="form-control" value={room.numCoats}
                  onChange={e => updateRoom(idx, 'numCoats', parseInt(e.target.value))}>
                  <option value={1}>1 Coat</option>
                  <option value={2}>2 Coats (Recommended)</option>
                  <option value={3}>3 Coats (Premium)</option>
                </select>
              </div>
            </div>

            {/* Show individual result */}
            {calculated && results[idx] && (
              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16, marginTop: 8, border: '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 600, marginBottom: 10, color: '#2d3436' }}>📊 {room.roomName} Estimate</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72', marginBottom: 2 }}>Paintable Area</div>
                    <div style={{ fontWeight: 700, color: '#0984e3' }}>{results[idx].paintableArea} sq.ft</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72', marginBottom: 2 }}>Paint Needed</div>
                    <div style={{ fontWeight: 700, color: '#e17055' }}>{results[idx].litersNeeded} Liters</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72', marginBottom: 2 }}>Paint Cost</div>
                    <div style={{ fontWeight: 700, color: '#6c5ce7' }}>₹{results[idx].paintCost.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#636e72', marginBottom: 2 }}>Labour Cost</div>
                    <div style={{ fontWeight: 700, color: '#00b894' }}>₹{results[idx].laborCost.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={calculate} className="btn btn-primary" disabled={loading}
          style={{ padding: '14px 40px', fontSize: 16 }}>
          {loading ? '⏳ Calculating...' : '🔍 Calculate Estimate'}
        </button>
      </div>

      {/* Grand total */}
      {calculated && results.length > 0 && (
        <div className="estimate-result" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <h3>Total Rooms</h3>
              <div className="amount">{rooms.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3>Total Paint Required</h3>
              <div className="amount">{totalLiters.toFixed(1)} L</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3>Total Estimated Cost</h3>
              <div className="amount">₹{totalCost.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {results.map((r, i) => (
            <div key={i} className="estimate-row">
              <span>{rooms[i].roomName}</span>
              <span>{r.litersNeeded}L — ₹{r.totalCost.toLocaleString('en-IN')}</span>
            </div>
          ))}

          <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} className="btn btn-outline"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}>
              🖨️ Print Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}