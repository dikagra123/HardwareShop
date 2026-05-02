import { useState, useEffect } from 'react';
import { getInventory, addMaterial, updateStock } from '../api';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'paint', unit: 'liter', pricePerUnit: '', stockQuantity: '', lowStockAlert: 10 });

  const load = () => {
    setLoading(true);
    getInventory().then(r => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await addMaterial(form); setShowForm(false); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleStock = async (id, qty, op) => {
    try { await updateStock(id, { quantity: qty, operation: op }); load(); }
    catch { alert('Stock update failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Inventory</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="card-title">Add Material / Product</h2>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="paint">Paint</option>
                  <option value="material">Material</option>
                  <option value="tool">Tool</option>
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Unit</label>
                <input className="form-control" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="liter / kg / piece" />
              </div>
              <div className="form-group">
                <label>Price per Unit (₹)</label>
                <input className="form-control" type="number" required value={form.pricePerUnit} onChange={e => setForm({...form, pricePerUnit: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Initial Stock</label>
                <input className="form-control" type="number" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✓ Save Item</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="loading"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Unit</th><th>Price</th><th>Stock</th><th>Status</th><th>Adjust Stock</th></tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isLow = item.stock_quantity <= item.low_stock_alert;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                      <td>{item.unit}</td>
                      <td>₹{parseFloat(item.price_per_unit).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: isLow ? '#d63031' : '#2d3436' }}>
                        {parseFloat(item.stock_quantity)} {item.unit}
                      </td>
                      <td>
                        <span className={`badge badge-${isLow ? 'unpaid' : 'paid'}`}>{isLow ? 'Low Stock' : 'OK'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button onClick={() => { const q = prompt('Add quantity:'); if (q) handleStock(item.id, q, 'add'); }}
                            className="btn btn-success btn-sm">+ Add</button>
                          <button onClick={() => { const q = prompt('Remove quantity:'); if (q) handleStock(item.id, q, 'subtract'); }}
                            className="btn btn-danger btn-sm">− Use</button>
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