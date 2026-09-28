'use client';

import React, { useState, useEffect } from 'react';
import { Trash, Edit, Plus, X, Check, Info } from 'lucide-react';

interface TrashType {
  id: string;
  name: string;
  slot: number;
  pricePerKg: number;
  description: string | null;
}

export default function AdminTrashTypes() {
  const [types, setTypes] = useState<TrashType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slot, setSlot] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTrashTypes = async () => {
    try {
      const res = await fetch('/api/admin/trash-types');
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      } else {
        setErrorMsg('Gagal memuat jenis sampah.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Kesalahan koneksi saat mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrashTypes();
  }, []);

  const handleEditClick = (type: TrashType) => {
    setEditingId(type.id);
    setName(type.name);
    setSlot(type.slot.toString());
    setPricePerKg(type.pricePerKg.toString());
    setDescription(type.description || '');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlot('');
    setPricePerKg('');
    setDescription('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || slot === '' || pricePerKg === '') {
      setErrorMsg('Nama, slot, dan harga per kg wajib diisi.');
      return;
    }

    const numSlot = parseInt(slot);
    if (isNaN(numSlot) || numSlot < 0) {
      setErrorMsg('Slot harus berupa angka non-negatif.');
      return;
    }

    const numPrice = parseFloat(pricePerKg);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Harga per kg harus berupa angka positif.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId 
        ? `/api/admin/trash-types/${editingId}` 
        : '/api/admin/trash-types';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slot: numSlot, pricePerKg: numPrice, description }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(editingId ? 'Jenis sampah berhasil diperbarui!' : 'Jenis sampah baru berhasil ditambahkan!');
        setName('');
        setSlot('');
        setPricePerKg('');
        setDescription('');
        setEditingId(null);
        await loadTrashTypes();
      } else {
        setErrorMsg(data.error || 'Terjadi kesalahan saat memproses data.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, typeName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jenis sampah "${typeName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/trash-types/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccessMsg('Jenis sampah berhasil dihapus.');
        await loadTrashTypes();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Gagal menghapus jenis sampah.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi saat menghapus.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div style={{
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          border: '3px solid rgba(16, 185, 129, 0.1)',
          borderTopColor: '#10b981',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
          Kelola Jenis Sampah
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tambahkan jenis sampah baru, atur ketersediaan slot, harga per kg, atau hapus jenis sampah yang tidak terpakai.
        </p>
      </div>

      {(errorMsg || successMsg) && (
        <div style={{ marginBottom: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              background: 'var(--error-bg)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'var(--error)',
              fontSize: '0.9rem',
            }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{
              background: 'var(--success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'var(--success)',
              fontSize: '0.9rem',
            }}>
              {successMsg}
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Form */}
        <div className="glass-card">
          <h3 style={{
            fontSize: '1.2rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: editingId ? 'var(--accent)' : 'white'
          }}>
            {editingId ? <Edit size={18} /> : <Plus size={18} />}
            {editingId ? 'Ubah Jenis Sampah' : 'Tambah Jenis Sampah Baru'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Jenis Sampah</label>
              <input
                type="text"
                placeholder="Contoh: Organik, Logam, dll"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah Slot Tersedia</label>
              <input
                type="number"
                placeholder="Contoh: 10"
                className="form-input"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harga per Kg (Rp)</label>
              <input
                type="number"
                placeholder="Contoh: 5000"
                className="form-input"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea
                placeholder="Keterangan mengenai sampah ini..."
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1, padding: '0.65rem' }}
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Simpan' : 'Tambah'}
                <Check size={16} />
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  style={{ padding: '0.65rem' }}
                >
                  Batal
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: List Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Slot</th>
                  <th>Harga/Kg</th>
                  <th>Deskripsi</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Belum ada data jenis sampah.
                    </td>
                  </tr>
                ) : (
                  types.map((type) => (
                    <tr key={type.id} style={{
                      backgroundColor: editingId === type.id ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}>
                      <td style={{ fontWeight: 600, color: 'white' }}>{type.name}</td>
                      <td>
                        {type.slot <= 0 ? (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '0.25rem',
                            display: 'inline-block'
                          }}>
                            slot habis
                          </span>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{type.slot}</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                        Rp {type.pricePerKg.toLocaleString('id-ID')}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {type.description || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditClick(type)}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '0.4rem',
                              borderRadius: '0.4rem',
                              display: 'flex',
                              transition: 'all 0.2s'
                            }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id, type.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              color: 'var(--error)',
                              cursor: 'pointer',
                              padding: '0.4rem',
                              borderRadius: '0.4rem',
                              display: 'flex',
                              transition: 'all 0.2s'
                            }}
                            title="Hapus"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}