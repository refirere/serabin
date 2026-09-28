'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, Calendar, User, MapPin, Scale, ImageIcon, FileText } from 'lucide-react';

interface TrashPhoto {
  imageUrl: string;
}

interface TrashType {
  name: string;
  pricePerKg: number;
}

interface Region {
  name: string;
}

interface UserData {
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  transactionNumber: string;
  weight: number;
  totalPrice: number;
  paymentMethod: string | null;
  paymentStatus: string;
  status: string;
  createdAt: string;
  user: UserData;
  trashType: TrashType;
  region: Region;
  trashPhoto: TrashPhoto | null;
}

export default function AdminVerification() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        setErrorMsg('Gagal mengambil data transaksi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Kesalahan koneksi saat memuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    const confirmText = action === 'APPROVE' 
      ? 'Apakah Anda yakin ingin menyetujui (ACC) pembayaran untuk transaksi ini?' 
      : 'Apakah Anda yakin ingin menolak transaksi ini? Slot akan dikembalikan.';
      
    if (!confirm(confirmText)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await loadTransactions();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal memperbarui status transaksi.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setActionId(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'pending') {
      return tx.status === 'WAITING_VERIFICATION';
    }
    return true;
  });

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
          Verifikasi Pembayaran & Pengajuan
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tinjau pengajuan pemilahan sampah dari pengguna, periksa bukti pembayaran transfer, dan berikan persetujuan (ACC).
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
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'pending' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'pending' ? '2px solid var(--accent)' : '2px solid transparent',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
        >
          Menunggu Verifikasi (
          {transactions.filter((t) => t.status === 'WAITING_VERIFICATION').length}
          )
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'all' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'all' ? '2px solid var(--accent)' : '2px solid transparent',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
        >
          Semua Transaksi
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="glass-card" style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <ShieldAlert size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>
              Tidak ada data transaksi
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              {activeTab === 'pending' 
                ? 'Semua pengajuan pembayaran pengguna telah selesai diproses.' 
                : 'Belum ada transaksi yang tercatat dalam sistem.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredTransactions.map((tx) => {
            const isPendingVerification = tx.status === 'WAITING_VERIFICATION';

            return (
              <div key={tx.id} className="glass-card" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                borderLeft: isPendingVerification ? '4px solid #f59e0b' : tx.status === 'APPROVED' ? '4px solid #10b981' : '4px solid #ef4444'
              }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {tx.transactionNumber}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginTop: '0.15rem' }}>
                      {tx.trashType?.name || '-'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Calendar size={12} /> {new Date(tx.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{tx.user?.name || '-'} ({tx.user?.email || '-'})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{tx.region?.name || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Scale size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Berat: <strong style={{ color: 'white' }}>{tx.weight || 0} kg</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={14} style={{ color: 'var(--accent)' }} />
                      <span>Total: <strong style={{ color: 'var(--accent)' }}>Rp {(tx.totalPrice || 0).toLocaleString('id-ID')}</strong></span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        (@ Rp {(tx.trashType?.pricePerKg || 0).toLocaleString('id-ID')}/kg)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span className={`badge ${tx.status === 'APPROVED' ? 'badge-success' : tx.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                      {tx.status === 'APPROVED' ? 'Disetujui' : tx.status === 'REJECTED' ? 'Ditolak' : 'Butuh Verifikasi'}
                    </span>
                    <span className={`badge ${tx.paymentStatus === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                    {tx.paymentMethod && (
                      <span className="badge badge-info" style={{ textTransform: 'none' }}>
                        Bank: {tx.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ImageIcon size={14} /> Bukti Foto Sampah:
                  </span>
                  
                  {tx.trashPhoto?.imageUrl ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '160px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <img
                        src={tx.trashPhoto.imageUrl}
                        alt="Bukti Sampah"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      border: '1px dashed var(--border-color)',
                      fontSize: '0.85rem'
                    }}>
                      Tidak ada foto sampah
                    </div>
                  )}
                </div>

                {isPendingVerification && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingLeft: '1.5rem'
                  }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAction(tx.id, 'APPROVE')}
                      disabled={actionId !== null}
                      style={{ fontSize: '0.85rem', width: '100%' }}
                    >
                      <Check size={16} /> ACC Pembayaran
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleAction(tx.id, 'REJECT')}
                      disabled={actionId !== null}
                      style={{ fontSize: '0.85rem', width: '100%' }}
                    >
                      <X size={16} /> Tolak Pengajuan
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}