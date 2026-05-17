import { useState, useEffect } from 'react';
import { getInventory, addMaterial, updateStock } from '../api';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', category: 'paint', unit: 'liter',
    pricePerUnit: '', stockQuantity: '', lowStockAlert: 10
  });

  const load = () => {
    setLoading(true);
    getInventory().then(r => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addMaterial(form);
      setMsg('✅ Item added successfully!');
      setForm({ name: '', category: 'paint', unit: 'liter', pricePerUnit: '', stockQuantity: '', lowStockAlert: 10 });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to add item'));
    }
  };

  const handleAdd1 = async (item) => {
    const q = prompt('Enter quantity to ADD to stock:');
    if (q && !isNaN(q) && parseFloat(q) > 0) {
      try {
        await updateStock(item._id || item.id, { quantity: parseFloat(q), operation: 'add' });
        load();
      } catch { alert('Failed to update stock'); }
    }
  };

  const handleSubtract = async (item) => {
    const q = prompt('Enter quantity to USE/REMOVE from stock:');
    if (q && !isNaN(q) && parseFloat(q) > 0) {
      try {
        await updateStock(item._id || item.id, { quantity: parseFloat(q), operation: 'subtract' });
        load();
      } catch { alert('Failed to update stock'); }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Inventory</h1>
        <button onClick={() => { setShowForm(!showForm); setMsg(''); }}
          className="btn btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="card-title">Add Material / Product</h2>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Asian Paints Emulsion" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="paint">Paint</option>
                  <option value="material">Material</option>
                  <option value="tool">Tool</option>
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Unit</label>
                <input className="form-control" value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  placeholder="liter / kg / piece" />
              </div>
              <div className="form-group">
                <label>Price per Unit (₹)</label>
                <input className="form-control" type="number" required
                  value={form.pricePerUnit}
                  onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Initial Stock</label>
                <input className="form-control" type="number"
                  value={form.stockQuantity}
                  onChange={e => setForm({ ...form, stockQuantity: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✓ Save Item</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#636e72' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No items in inventory</div>
            <div style={{ fontSize: 13 }}>Click "+ Add Item" to add your first item</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Adjust Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const stock = parseFloat(item.stockQuantity || item.stock_quantity || 0);
                  const alert = parseFloat(item.lowStockAlert || item.low_stock_alert || 10);
                  const isLow = stock <= alert;
                  return (
                    <tr key={item._id || item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                      <td>{item.unit}</td>
                      <td>₹{parseFloat(item.pricePerUnit || item.price_per_unit || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: isLow ? '#d63031' : '#2d3436' }}>
                        {stock} {item.unit}
                      </td>
                      <td>
                        <span className={`badge badge-${isLow ? 'unpaid' : 'paid'}`}>
                          {isLow ? 'Low Stock' : 'OK'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleAdd1(item)}
                            className="btn btn-success btn-sm">
                            + Add
                          </button>
                          <button onClick={() => handleSubtract(item)}
                            className="btn btn-danger btn-sm">
                            − Use
                          </button>
                        </div>
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