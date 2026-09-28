'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Save, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminWeightSetting() {
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSetting() {
      try {
        const res = await fetch('/api/admin/weight-setting');
        if (res.ok) {
          const data = await res.json();
          setMinWeight(data.minWeight.toString());
          setMaxWeight(data.maxWeight.toString());
        } else {
          setErrorMsg('Gagal mengambil data konfigurasi berat.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Kesalahan koneksi saat mengambil konfigurasi.');
      } finally {
        setLoading(false);
      }
    }
    loadSetting();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (minWeight === '' || maxWeight === '') {
      setErrorMsg('Berat minimal dan maksimal wajib diisi.');
      return;
    }

    const min = parseFloat(minWeight);
    const max = parseFloat(maxWeight);

    if (isNaN(min) || isNaN(max)) {
      setErrorMsg('Berat harus berupa angka.');
      return;
    }

    if (min < 0 || max < 0) {
      setErrorMsg('Berat tidak boleh bernilai negatif.');
      return;
    }

    if (min >= max) {
      setErrorMsg('Berat minimal harus lebih kecil dari berat maksimal.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/weight-setting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minWeight: min, maxWeight: max }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Konfigurasi batas berat sampah berhasil diperbarui!');
        setMinWeight(data.minWeight.toString());
        setMaxWeight(data.maxWeight.toString());
      } else {
        setErrorMsg(data.error || 'Gagal memperbarui konfigurasi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
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
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
          Konfigurasi Batas Berat Sampah
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Atur batas minimum dan maksimum berat sampah dalam satuan kilogram (kg) yang dapat diajukan oleh pengguna.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--error-bg)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          color: 'var(--error)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={18} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          color: 'var(--success)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            color: 'var(--accent)',
            display: 'flex'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'white' }}>Batas Berat Wajib</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              *Konfigurasi ini wajib ada di sistem dan tidak dapat dihapus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div className="form-group">
              <label className="form-label">Min Berat (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Contoh: 0.5"
                className="form-input"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Max Berat (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Contoh: 50"
                className="form-input"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{
              alignSelf: 'flex-start',
              padding: '0.75rem 2rem',
              marginTop: '0.5rem'
            }}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            <Save size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
