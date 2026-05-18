import { useState } from 'react';

const recommendations = {
  interior_bedroom: {
    title: 'Bedroom - Interior Wall',
    description: 'Bedrooms need smooth, washable and low-VOC paints for a healthy environment.',
    top: [
      { name: 'Asian Paints Royale Atmos', price: 490, brand: 'Asian Paints', reason: 'Anti-bacterial, air purifying, perfect for bedroom', rating: 5, finish: 'Matt' },
      { name: 'Nerolac Impressions Eco Clean', price: 553, brand: 'Nerolac', reason: 'Low VOC, eco-friendly, washable finish', rating: 5, finish: 'Matt' },
      { name: 'Berger Silk Glamor Luxury Emulsion', price: 434, brand: 'Berger', reason: 'Silky smooth finish, stain resistant', rating: 4, finish: 'Silk' },
      { name: 'Asian Paints Apcolite Premium Emulsion', price: 438, brand: 'Asian Paints', reason: 'Good coverage, washable, value for money', rating: 4, finish: 'Matt' },
      { name: 'Nerolac Beauty Gold', price: 275, brand: 'Nerolac', reason: 'Budget friendly, good finish for bedroom', rating: 3, finish: 'Matt' },
    ],
    tips: [
      'Use light colours like cream, white or pastel shades for bedroom',
      'Always apply primer before painting for better results',
      'Minimum 2 coats recommended for even finish',
      'Low VOC paints are healthier for sleeping areas',
    ]
  },
  interior_living: {
    title: 'Living Room - Interior Wall',
    description: 'Living rooms need premium finish paints that look impressive and are easy to clean.',
    top: [
      { name: 'Asian Paints Royale Luxury Emulsion', price: 764, brand: 'Asian Paints', reason: 'Best premium finish, highly washable, long lasting', rating: 5, finish: 'Shyne' },
      { name: 'Asian Paints Royale Shyne', price: 450, brand: 'Asian Paints', reason: 'Shiny finish, stain proof, perfect for living rooms', rating: 5, finish: 'Shyne' },
      { name: 'Nerolac Impressions 24 Carat', price: 499, brand: 'Nerolac', reason: 'Premium luxury finish, gold standard quality', rating: 5, finish: 'Lustre' },
      { name: 'Berger Silk Glamor Luxury Emulsion', price: 434, brand: 'Berger', reason: 'Crystal reflective technology, fills hairline cracks', rating: 4, finish: 'Silk' },
      { name: 'Asian Paints Apcolite Advanced Emulsion', price: 274, brand: 'Asian Paints', reason: 'Good quality at mid-range price', rating: 4, finish: 'Matt' },
    ],
    tips: [
      'Go for shyne or silk finish for a premium look in living room',
      'Dark accent wall with light main walls looks modern',
      'Apply putty before painting for smooth finish',
      '3 coats give best results for living room walls',
    ]
  },
  interior_kitchen: {
    title: 'Kitchen - Interior Wall',
    description: 'Kitchen walls need moisture resistant, washable and anti-fungal paints.',
    top: [
      { name: 'Nerolac Excel Tile Guard', price: 262, brand: 'Nerolac', reason: 'Tile-like finish, highly washable, moisture resistant', rating: 5, finish: 'Gloss' },
      { name: 'Asian Paints Apcolite Premium Emulsion', price: 438, brand: 'Asian Paints', reason: 'Washable, stain resistant, good for kitchen walls', rating: 4, finish: 'Matt' },
      { name: 'Berger Easy Clean Interior', price: 364, brand: 'Berger', reason: 'Easy to clean stains, moisture resistant', rating: 4, finish: 'Matt' },
      { name: 'Nerolac Excel Anti Peel', price: 135, brand: 'Nerolac', reason: 'Anti-peel formula, good for damp kitchen walls', rating: 4, finish: 'Matt' },
      { name: 'Nerolac Suraksha Advanced', price: 173, brand: 'Nerolac', reason: 'Anti-fungal, budget option for kitchen', rating: 3, finish: 'Matt' },
    ],
    tips: [
      'Use semi-gloss or gloss finish for kitchen - easy to wipe',
      'Anti-fungal paint is must for kitchen walls',
      'Apply moisture barrier primer before painting',
      'Light colours like white or cream work best in kitchen',
    ]
  },
  interior_bathroom: {
    title: 'Bathroom - Interior Wall',
    description: 'Bathrooms need waterproof, anti-fungal and moisture resistant paints.',
    top: [
      { name: 'Nerolac Excel Tile Guard', price: 262, brand: 'Nerolac', reason: 'Waterproof tile-like finish, best for bathrooms', rating: 5, finish: 'Gloss' },
      { name: 'Nerolac Excel Anti Peel', price: 135, brand: 'Nerolac', reason: 'Anti-peel, perfect for wet bathroom walls', rating: 4, finish: 'Matt' },
      { name: 'Asian Paints Ace Advanced', price: 133, brand: 'Asian Paints', reason: 'Waterproof, anti-fungal, affordable', rating: 4, finish: 'Matt' },
      { name: 'Berger Easy Clean Interior', price: 364, brand: 'Berger', reason: 'Moisture resistant, washable finish', rating: 4, finish: 'Matt' },
      { name: 'Nerolac Suraksha', price: 77, brand: 'Nerolac', reason: 'Budget waterproof option for bathroom', rating: 3, finish: 'Matt' },
    ],
    tips: [
      'Always use waterproof primer in bathroom',
      'Gloss or semi-gloss finish recommended for bathrooms',
      'Anti-fungal paint prevents mold growth',
      'Light colours make small bathrooms look bigger',
    ]
  },
  exterior_normal: {
    title: 'Exterior Wall - Normal Weather',
    description: 'Exterior walls need weather resistant, UV protected and durable paints.',
    top: [
      { name: 'Asian Paints Royale Atmos', price: 490, brand: 'Asian Paints', reason: 'Best exterior protection, UV resistant, long lasting', rating: 5, finish: 'Matt' },
      { name: 'Nerolac Excel Total', price: 405, brand: 'Nerolac', reason: 'Total weather protection, anti-algae formula', rating: 5, finish: 'Matt' },
      { name: 'Berger WeatherCoat Long Life Exterior', price: 300, brand: 'Berger', reason: 'PU technology, excellent rain protection', rating: 4, finish: 'Matt' },
      { name: 'Asian Paints Apex Floor Guard', price: 707, brand: 'Asian Paints', reason: 'Premium exterior, dirt proof technology', rating: 4, finish: 'Matt' },
      { name: 'Berger WeatherCoat Champ Exterior', price: 311, brand: 'Berger', reason: 'Good weather resistance at mid-range price', rating: 3, finish: 'Matt' },
    ],
    tips: [
      'Always use exterior grade primer before painting',
      'Paint exterior walls in dry weather only',
      'Minimum 2 coats for proper coverage',
      'Light colours reflect heat and last longer on exterior',
    ]
  },
  exterior_coastal: {
    title: 'Exterior Wall - Coastal/High Rain Area',
    description: 'Coastal areas need paints with extra salt, humidity and heavy rain protection.',
    top: [
      { name: 'Nerolac Excel Total', price: 405, brand: 'Nerolac', reason: 'Best for coastal areas, anti-algae, salt resistant', rating: 5, finish: 'Matt' },
      { name: 'Berger WeatherCoat Long Life Exterior', price: 300, brand: 'Berger', reason: 'PU & Silicon technology, proven in heavy rainfall', rating: 5, finish: 'Matt' },
      { name: 'Nerolac Excel Everlast', price: 183, brand: 'Nerolac', reason: 'Excellent durability in humid conditions', rating: 4, finish: 'Matt' },
      { name: 'Asian Paints Apex Floor Guard', price: 707, brand: 'Asian Paints', reason: 'Superior waterproofing, UV protection', rating: 4, finish: 'Matt' },
      { name: 'Berger WeatherCoat Champ Exterior', price: 311, brand: 'Berger', reason: 'Good protection against heavy rain', rating: 3, finish: 'Matt' },
    ],
    tips: [
      'Use waterproofing coat before exterior paint in coastal areas',
      'Anti-algae paint is must for humid coastal areas',
      'Apply paint in 3 coats for maximum protection',
      'Check walls for cracks and fill before painting',
    ]
  },
  wood_furniture: {
    title: 'Wood / Furniture Surface',
    description: 'Wood surfaces need special paints that protect against moisture and give smooth finish.',
    top: [
      { name: 'Asian Paints Woodtech Aquadur PU Interior', price: 713, brand: 'Asian Paints', reason: 'Best PU finish for indoor furniture, durable', rating: 5, finish: 'Gloss' },
      { name: 'Asian Paints Woodtech PU Exterior', price: 700, brand: 'Asian Paints', reason: 'Weather resistant for outdoor wood surfaces', rating: 5, finish: 'Gloss' },
      { name: 'Asian Paints Woodtech Wood Stains', price: 300, brand: 'Asian Paints', reason: 'Natural wood look, enhances grain texture', rating: 4, finish: 'Satin' },
      { name: 'Asian Paints Woodtech Melamyne', price: 245, brand: 'Asian Paints', reason: 'Good melamine finish for furniture', rating: 4, finish: 'Gloss' },
      { name: 'Berger Luxol Hi-Gloss Enamel', price: 239, brand: 'Berger', reason: 'High gloss finish for doors and wooden frames', rating: 3, finish: 'Gloss' },
    ],
    tips: [
      'Sand the wood surface before applying paint',
      'Apply wood primer first for better adhesion',
      'PU finish is most durable for furniture',
      'Use wood stain if you want natural wood look',
    ]
  },
  wall_texture: {
    title: 'Texture / Decorative Wall',
    description: 'Feature walls that need special texture or decorative finish effects.',
    top: [
      { name: 'Asian Paints Royale Play Special Effects', price: 1818, brand: 'Asian Paints', reason: 'Best special effect finishes, unique wall designs', rating: 5, finish: 'Texture' },
      { name: 'Asian Paints Royale Play Metallics', price: 1815, brand: 'Asian Paints', reason: 'Metallic sheen, very premium look', rating: 5, finish: 'Metallic' },
      { name: 'Asian Paints Royale Play Dune', price: 1670, brand: 'Asian Paints', reason: 'Sand texture finish, natural desert look', rating: 4, finish: 'Texture' },
      { name: 'Nerolac Pearls Lustre Finish', price: 268, brand: 'Nerolac', reason: 'Pearl lustre effect at affordable price', rating: 4, finish: 'Lustre' },
      { name: 'Nerolac Excel Mica Marble', price: 322, brand: 'Nerolac', reason: 'Marble effect finish for feature walls', rating: 4, finish: 'Marble' },
    ],
    tips: [
      'Texture paints need professional application for best results',
      'Use on accent/feature wall only not all walls',
      'Proper base coat is essential before texture paint',
      'Seal texture paint with clear coat for durability',
    ]
  },
};

const wallTypes = [
  { id: 'interior_bedroom',  label: 'Bedroom',          icon: 'ti-bed',           desc: 'Interior bedroom walls' },
  { id: 'interior_living',   label: 'Living Room',      icon: 'ti-sofa',          desc: 'Interior living/hall walls' },
  { id: 'interior_kitchen',  label: 'Kitchen',          icon: 'ti-tools-kitchen', desc: 'Interior kitchen walls' },
  { id: 'interior_bathroom', label: 'Bathroom',         icon: 'ti-bath',          desc: 'Interior bathroom walls' },
  { id: 'exterior_normal',   label: 'Exterior Normal',  icon: 'ti-building',      desc: 'Exterior walls normal weather' },
  { id: 'exterior_coastal',  label: 'Exterior Coastal', icon: 'ti-waves',         desc: 'Coastal or heavy rain area' },
  { id: 'wood_furniture',    label: 'Wood/Furniture',   icon: 'ti-armchair',      desc: 'Wooden surfaces and furniture' },
  { id: 'wall_texture',      label: 'Texture/Décor',    icon: 'ti-texture',       desc: 'Special texture feature walls' },
];

const brandColors = {
  'Asian Paints': { bg: '#E6F1FB', color: '#185FA5' },
  'Berger':       { bg: '#E1F5EE', color: '#0F6E56' },
  'Nerolac':      { bg: '#EEEDFE', color: '#534AB7' },
};

const finishColors = {
  'Matt':    { bg: '#F1EFE8', color: '#5F5E5A' },
  'Silk':    { bg: '#FBEAF0', color: '#993556' },
  'Shyne':   { bg: '#E6F1FB', color: '#185FA5' },
  'Gloss':   { bg: '#FAEEDA', color: '#854F0B' },
  'Lustre':  { bg: '#EEEDFE', color: '#534AB7' },
  'Texture': { bg: '#FAECE7', color: '#993C1D' },
  'Metallic':{ bg: '#F1EFE8', color: '#444441' },
  'Satin':   { bg: '#E1F5EE', color: '#0F6E56' },
  'Marble':  { bg: '#FCEBEB', color: '#A32D2D' },
};

export default function PaintRecommendation() {
  const [selected, setSelected] = useState(null);
  const [budget, setBudget] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const rec = selected ? recommendations[selected] : null;

  const filtered = rec ? rec.top.filter(p => {
    if (budget === 'budget')  return p.price < 250;
    if (budget === 'mid')     return p.price >= 250 && p.price <= 500;
    if (budget === 'premium') return p.price > 500;
    return true;
  }) : [];

  const renderStars = (n) => Array.from({ length: 5 }, (_, i) => (
    <i key={i}
      className={i < n ? 'ti ti-star-filled' : 'ti ti-star'}
      style={{ fontSize: 13, color: i < n ? '#EF9F27' : '#ddd' }}
      aria-hidden="true" />
  ));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎨 Paint Recommendation System</h1>
          <p style={{ color: '#636e72', fontSize: 14, marginTop: 4 }}>
            Select wall type to get the best paint recommendations
          </p>
        </div>
      </div>

      {/* Wall type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {wallTypes.map(w => (
          <div key={w.id}
            onClick={() => { setSelected(w.id); setShowAll(false); setBudget('all'); }}
            style={{
              background: selected === w.id ? 'linear-gradient(135deg,#e17055,#d63031)' : 'white',
              border: `1px solid ${selected === w.id ? '#e17055' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: 14, padding: 16, cursor: 'pointer',
              transition: 'all 0.2s', textAlign: 'center',
              transform: selected === w.id ? 'translateY(-4px)' : '',
              boxShadow: selected === w.id ? '0 8px 24px rgba(225,112,85,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
            <i className={`ti ${w.icon}`}
              style={{ fontSize: 28, color: selected === w.id ? 'white' : '#e17055', display: 'block', marginBottom: 8 }}
              aria-hidden="true" />
            <div style={{ fontWeight: 600, fontSize: 13, color: selected === w.id ? 'white' : '#1a1a2e', marginBottom: 2 }}>
              {w.label}
            </div>
            <div style={{ fontSize: 11, color: selected === w.id ? 'rgba(255,255,255,0.8)' : '#636e72' }}>
              {w.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {rec && (
        <div>
          {/* Header */}
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(225,112,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${wallTypes.find(w => w.id === selected)?.icon}`}
                  style={{ fontSize: 26, color: '#e17055' }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{rec.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{rec.description}</div>
              </div>
            </div>
          </div>

          {/* Budget filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#636e72', fontWeight: 500 }}>Filter by budget:</span>
            {[
              { id: 'all',     label: 'All Budgets' },
              { id: 'budget',  label: 'Budget (< ₹250/L)' },
              { id: 'mid',     label: 'Mid (₹250-500/L)' },
              { id: 'premium', label: 'Premium (> ₹500/L)' },
            ].map(b => (
              <button key={b.id} onClick={() => setBudget(b.id)}
                className={`btn btn-sm ${budget === b.id ? 'btn-primary' : 'btn-outline'}`}>
                {b.label}
              </button>
            ))}
          </div>

          {/* Paint cards */}
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 30, color: '#636e72' }}>
              No paints found in this budget range for the selected wall type.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              {filtered.map((paint, i) => {
                const bc = brandColors[paint.brand] || { bg: '#f0f0f0', color: '#333' };
                const fc = finishColors[paint.finish] || { bg: '#f0f0f0', color: '#333' };
                return (
                  <div key={i} className="card"
                    style={{ border: i === 0 ? '2px solid #e17055' : '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>

                    {/* Best choice badge */}
                    {i === 0 && (
                      <div style={{ position: 'absolute', top: -1, right: 16, background: '#e17055', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: '0 0 8px 8px' }}>
                        ⭐ TOP PICK
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {/* Rank */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#e17055' : '#f0f0f0', color: i === 0 ? 'white' : '#636e72', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{paint.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span style={{ background: bc.bg, color: bc.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                                {paint.brand}
                              </span>
                              <span style={{ background: fc.bg, color: fc.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                                {paint.finish}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        <div style={{ fontSize: 13, color: '#636e72', marginLeft: 38, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <i className="ti ti-check-circle" style={{ color: '#0F6E56', fontSize: 15, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                          {paint.reason}
                        </div>

                        {/* Stars */}
                        <div style={{ marginLeft: 38, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {renderStars(paint.rating)}
                          <span style={{ fontSize: 12, color: '#636e72', marginLeft: 4 }}>
                            {paint.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#185FA5' }}>
                          ₹{paint.price.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 11, color: '#636e72' }}>per litre</div>
                        <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>
                          20L ≈ ₹{(paint.price * 20).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips section */}
          <div className="card" style={{ background: '#f0fff8', border: '1px solid #b2dfdb' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-bulb" style={{ fontSize: 18 }} aria-hidden="true" />
              Expert Tips for {rec.title}
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {rec.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#2d3436' }}>
                  <i className="ti ti-check" style={{ color: '#0F6E56', fontSize: 15, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Comparison summary */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>
              <i className="ti ti-chart-bar" style={{ marginRight: 8, color: '#185FA5' }} aria-hidden="true" />
              Quick Comparison
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#636e72', fontSize: 11, textTransform: 'uppercase' }}>Paint</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#636e72', fontSize: 11, textTransform: 'uppercase' }}>Brand</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#636e72', fontSize: 11, textTransform: 'uppercase' }}>Finish</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#636e72', fontSize: 11, textTransform: 'uppercase' }}>Rating</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#636e72', fontSize: 11, textTransform: 'uppercase' }}>Price/L</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.top.map((paint, i) => {
                    const bc = brandColors[paint.brand] || { bg: '#f0f0f0', color: '#333' };
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: i === 0 ? 700 : 400, color: '#1a1a2e' }}>
                          {i === 0 && <i className="ti ti-star-filled" style={{ color: '#EF9F27', marginRight: 4, fontSize: 12 }} aria-hidden="true" />}
                          {paint.name}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: bc.bg, color: bc.color, fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                            {paint.brand}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#636e72' }}>{paint.finish}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            {renderStars(paint.rating)}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#185FA5' }}>
                          ₹{paint.price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Default state */}
      {!selected && (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <i className="ti ti-paint" style={{ fontSize: 52, color: '#dfe6e9', display: 'block', marginBottom: 16 }} aria-hidden="true" />
          <div style={{ fontWeight: 700, fontSize: 18, color: '#636e72', marginBottom: 8 }}>
            Select a wall type above
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>
            Get expert paint recommendations with prices and tips
          </div>
        </div>
      )}
    </div>
  );
}