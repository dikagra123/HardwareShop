import { useState } from 'react';
import { calculatePaint } from '../api';

const paintBrands = [
  // ── ASIAN PAINTS INTERIOR EMULSIONS ──
  { name: 'Asian Paints Royale Luxury Emulsion',     price: 764  }, // 20L = ₹15280
  { name: 'Asian Paints Royale Atmos',               price: 490  }, // 20L = ₹9790
  { name: 'Asian Paints Royale Shyne',               price: 450  }, // 20L = ₹8996
  { name: 'Asian Paints Apcolite Premium Emulsion',  price: 438  }, // 20L = ₹8750
  { name: 'Asian Paints Apcolite Advanced Emulsion', price: 274  }, // 20L = ₹5479
  { name: 'Asian Paints Royale Wall Basecoat',       price: 160  }, // 20L = ₹3206
  { name: 'Asian Paints Ace Advanced',               price: 133  }, // 20L = ₹2668

  // ── ASIAN PAINTS EXTERIOR ──
  { name: 'Asian Paints Apex Floor Guard',           price: 707  }, // 4L = ₹2826
  { name: 'Asian Paints Woodtech Aquadur PU',        price: 713  }, // 4L = ₹2850

  // ── ASIAN PAINTS PRIMERS ──
  { name: 'Asian Paints Trucare Exterior Primer',    price: 129  }, // 20L = ₹2574
  { name: 'Asian Paints Decoprime Cement Primer',    price: 165  }, // 20L = ₹3300
  { name: 'Asian Paints Trucare Interior Primer',    price: 147  }, // 20L = ₹2934

  // ── ASIAN PAINTS SPECIAL EFFECTS ──
  { name: 'Asian Paints Royale Play Dune',           price: 1670 }, // 1L = ₹1670
  { name: 'Asian Paints Royale Play Metallics',      price: 1815 }, // 1L = ₹1815
  { name: 'Asian Paints Royale Play Special Effects',price: 1818 }, // 1L = ₹1818

  // ── ASIAN PAINTS WOOD FINISHES ──
  { name: 'Asian Paints Woodtech Wood Stains',       price: 300  }, // 5L = ₹1500
  { name: 'Asian Paints Woodtech Melamyne',          price: 245  }, // 20L = ₹4900
  { name: 'Asian Paints Woodtech PU Palette Interior',price: 675 }, // 4L = ₹2700
  { name: 'Asian Paints Woodtech PU Palette Exterior',price: 700 }, // 4L = ₹2800

  // ── BERGER PAINTS ──
  { name: 'Berger Easy Clean Interior',              price: 364  },
  { name: 'Berger Silk Glamor Luxury Emulsion',      price: 434  },
  { name: 'Berger WeatherCoat Long Life Exterior',   price: 300  },
  { name: 'Berger WeatherCoat Champ Exterior',       price: 311  },
  { name: 'Berger Rangoli Total Care',               price: 253  },
  { name: 'Berger Bison Acrylic Emulsion',           price: 230  },
  { name: 'Berger Luxol Hi-Gloss Enamel',            price: 239  },

  // ── NEROLAC ──
  { name: 'Nerolac Excel Total Exterior',            price: 310  },
  { name: 'Nerolac Impressions Interior',            price: 390  },
  { name: 'Nerolac Beauty Gold Emulsion',            price: 260  },

  // ── NEROLAC PAINTS ──
{ name: 'Nerolac Impressions Eco Clean',      price: 553  }, // 20L = ₹11069
{ name: 'Nerolac Impressions 24 Carat',       price: 499  }, // 20L = ₹9982
{ name: 'Nerolac Excel Total',                price: 405  }, // 20L = ₹8103
{ name: 'Nerolac Beauty Gold',                price: 275  }, // 20L = ₹5507
{ name: 'Nerolac Pearls Emulsion',            price: 263  }, // 20L = ₹5264
{ name: 'Nerolac Excel',                      price: 262  }, // 20L = ₹5247
{ name: 'Nerolac Excel Tile Guard',           price: 262  }, // 20L = ₹5237
{ name: 'Nerolac Excel Mica Marble',          price: 322  }, // 20L = ₹6435
{ name: 'Nerolac Excel Everlast',             price: 183  }, // 20L = ₹3659
{ name: 'Nerolac Beauty Silver',              price: 176  }, // 20L = ₹3524
{ name: 'Nerolac Suraksha Advanced',          price: 173  }, // 20L = ₹3469
{ name: 'Nerolac Suraksha Plus',              price: 152  }, // 20L = ₹3038
{ name: 'Nerolac Excel Anti Peel',            price: 135  }, // 20L = ₹2700
{ name: 'Nerolac Lotus Touch',                price: 241  }, // 20L = ₹4815
{ name: 'Nerolac Little Master',              price: 111  }, // 20L = ₹2211
{ name: 'Nerolac Suraksha',                   price: 77   }, // 20L = ₹1535
{ name: 'Nerolac Beauty Smooth Finish',       price: 83   }, // 20L = ₹1668
{ name: 'Nerolac Pearls Lustre Finish',       price: 268  }, // 1L  = ₹268
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