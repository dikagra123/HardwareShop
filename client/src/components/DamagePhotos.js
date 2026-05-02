import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function DamagePhotos({ jobId }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileRef = useRef();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadPhotos(); }, [jobId]);

  const loadPhotos = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/uploads/damage/${jobId}`, { headers });
    setPhotos(Array.isArray(res.data) ? res.data : []);
  } catch {
    setPhotos([]);
  }
};

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (valid.length === 0) { setMsg('Only JPG, PNG, WEBP images allowed'); return; }
    if (valid.length > 5) { setMsg('Maximum 5 photos at once'); return; }
    setSelectedFiles(valid);
    const previews = valid.map(f => ({ name: f.name, url: URL.createObjectURL(f), size: f.size }));
    setFilePreviews(previews);
    setMsg('');
  };

  const handleUpload = async () => {
  if (!selectedFiles || selectedFiles.length === 0) {
    setMsg('Please select photos first');
    return;
  }
  setUploading(true);
  setMsg('');
  try {
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('photos', selectedFiles[i]);
    }
    if (description) formData.append('description', description);

    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${API_URL}/api/uploads/damage/${jobId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setMsg(`✅ ${res.data.message}`);
    setSelectedFiles([]);
    setFilePreviews([]);
    setDescription('');
    loadPhotos();
  } catch (err) {
    console.error('Upload error:', err);
    setMsg('❌ Upload failed: ' + (err.response?.data?.error || err.message));
  } finally {
    setUploading(false);
  }
};

  const handleDelete = async (filename) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axios.delete(`${API_URL}/api/uploads/damage/${jobId}/${filename}`, { headers });
      loadPhotos();
    } catch { setMsg('Failed to delete photo'); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2d3436', margin: 0 }}>
          📸 Damage Photos
        </h2>
        {photos.length > 0 && (
          <span style={{ background: '#e17055', color: 'white', borderRadius: 20,
            padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
            {photos.length}
          </span>
        )}
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? '#e17055' : '#dfe6e9'}`,
          borderRadius: 12, padding: '28px 20px', textAlign: 'center',
          cursor: 'pointer', background: dragOver ? '#fff5f3' : '#fafafa',
          transition: 'all 0.2s', marginBottom: 16
        }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
        <div style={{ fontWeight: 600, color: '#2d3436', marginBottom: 4 }}>
          Click or drag photos here
        </div>
        <div style={{ fontSize: 13, color: '#636e72' }}>
          JPG, PNG, WEBP • Max 5MB • Up to 5 photos at once
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Selected previews */}
      {filePreviews.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#636e72', marginBottom: 8 }}>
            Selected ({filePreviews.length}):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
            {filePreviews.map((f, i) => (
              <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #dfe6e9' }}>
                <img src={f.url} alt={f.name}
                  style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '4px 6px', fontSize: 10, color: '#636e72',
                  background: '#f8f9fa', textAlign: 'center' }}>
                  {formatSize(f.size)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <input className="form-control" value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add description (e.g. Front wall crack, Ceiling damage...)" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleUpload} disabled={uploading} className="btn btn-primary">
              {uploading ? '⏳ Uploading...' : `⬆️ Upload ${filePreviews.length} Photo(s)`}
            </button>
            <button onClick={() => { setSelectedFiles([]); setFilePreviews([]); }}
              className="btn btn-outline">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {photos.map((photo, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden',
              border: '1px solid #dfe6e9', background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setPreview(photo)}>
                <img src={`${API_URL}${photo.url}`} alt={photo.originalName}
                  style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.background = '#f0f0f0'; e.target.style.height = '130px'; }} />
                <div style={{ position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>
                  🔍
                </div>
              </div>
              <div style={{ padding: '8px 10px' }}>
                {photo.description && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2d3436',
                    marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {photo.description}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#636e72', marginBottom: 6 }}>
                  {formatSize(photo.size)} • {new Date(photo.uploadedAt).toLocaleDateString('en-IN')}
                </div>
                <button onClick={() => handleDelete(photo.filename)}
                  style={{ width: '100%', padding: '4px', background: '#fff5f5',
                    border: '1px solid #ffcccc', borderRadius: 6,
                    color: '#d63031', cursor: 'pointer', fontSize: 12 }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: '#636e72',
          fontSize: 14, background: '#f8f9fa', borderRadius: 10 }}>
          No damage photos uploaded yet
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ maxWidth: 800, width: '100%', background: 'white', borderRadius: 16, overflow: 'hidden' }}>
            <img src={`${API_URL}${preview.url}`} alt={preview.originalName}
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} />
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {preview.description && (
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{preview.description}</div>
                )}
                <div style={{ fontSize: 13, color: '#636e72' }}>
                  {preview.originalName} • {formatSize(preview.size)}
                </div>
              </div>
              <button onClick={() => setPreview(null)}
                style={{ padding: '8px 16px', background: '#2d3436', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}