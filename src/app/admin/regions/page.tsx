'use client';

import React, { useState, useEffect } from 'react';
import { Trash, Edit, Plus, X, Check } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  slot: number;
}

export default function AdminRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slot, setSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRegions = async () => {
    try {
      const res = await fetch('/api/admin/regions');
      if (res.ok) {
        const data = await res.json();
        setRegions(data);
      } else {
        setErrorMsg('Gagal memuat data wilayah.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Kesalahan koneksi saat mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const handleEditClick = (reg: Region) => {
    setEditingId(reg.id);
    setName(reg.name);
    setSlot(reg.slot.toString());
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlot('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || slot === '') {
      setErrorMsg('Nama dan slot wajib diisi.');
      return;
    }

    const numSlot = parseInt(slot);
    if (isNaN(numSlot) || numSlot < 0) {
      setErrorMsg('Slot harus berupa angka non-negatif.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId 
        ? `/api/admin/regions/${editingId}` 
        : '/api/admin/regions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slot: numSlot }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(editingId ? 'Wilayah berhasil diperbarui!' : 'Wilayah baru berhasil ditambahkan!');
        setName('');
        setSlot('');
        setEditingId(null);
        await loadRegions();
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

  const handleDelete = async (id: string, regName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus wilayah "${regName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/regions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccessMsg('Wilayah berhasil dihapus.');
        await loadRegions();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Gagal menghapus wilayah.');
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
          Kelola Wilayah Terdaftar
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tambahkan cakupan wilayah penjemputan sampah baru, perbarui slot, atau hapus wilayah yang sudah tidak didukung.
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
            {editingId ? 'Ubah Wilayah' : 'Tambah Wilayah Baru'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Wilayah</label>
              <input
                type="text"
                placeholder="Contoh: Jakarta Selatan, dll"
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
                placeholder="Contoh: 15"
                className="form-input"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                disabled={submitting}
                required
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
                  <th>Nama Wilayah</th>
                  <th>Slot Tersedia</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {regions.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Belum ada data wilayah.
                    </td>
                  </tr>
                ) : (
                  regions.map((reg) => (
                    <tr key={reg.id} style={{
                      backgroundColor: editingId === reg.id ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}>
                      <td style={{ fontWeight: 600, color: 'white' }}>{reg.name}</td>
                      <td>
                        {reg.slot <= 0 ? (
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
                          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{reg.slot}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditClick(reg)}
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
                            onClick={() => handleDelete(reg.id, reg.name)}
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
