'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Check, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

interface TrashPhoto {
  imageUrl: string;
}

interface TrashType {
  name: string;
}

interface Region {
  name: string;
}

interface Transaction {
  id: string;
  transactionNumber: string;
  weight: number;
  paymentMethod: string | null;
  paymentStatus: string;
  status: string;
  createdAt: string;
  trashType: TrashType;
  region: Region;
  trashPhoto: TrashPhoto | null;
}

export default function UserTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Selected payment methods per transaction ID
  const [paymentSelections, setPaymentSelections] = useState<Record<string, 'BCA' | 'SEABANK'>>({});

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/user/transactions');
      if (res.ok) {
        const data = await res.json();
        // Filter out completed ones (APPROVED or REJECTED) because those go to History!
        const active = data.filter((t: Transaction) => t.status === 'PENDING' || t.status === 'WAITING_VERIFICATION');
        setTransactions(active);
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

  const handleSelectPayment = (transactionId: string, method: 'BCA' | 'SEABANK') => {
    setPaymentSelections((prev) => ({
      ...prev,
      [transactionId]: method,
    }));
  };

  const handleConfirmPayment = async (transactionId: string) => {
    const selectedMethod = paymentSelections[transactionId];
    if (!selectedMethod) {
      alert('Silakan pilih salah satu metode pembayaran (BCA / Seabank) terlebih dahulu.');
      return;
    }

    setSubmittingId(transactionId);
    try {
      const res = await fetch(`/api/user/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedMethod }),
      });

      if (res.ok) {
        // Reload transactions
        await loadTransactions();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengkonfirmasi pembayaran.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmittingId(null);
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
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
          Transaksi Aktif
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Daftar pengajuan pemilahan sampah yang sedang berlangsung. Selesaikan pembayaran atau tunggu verifikasi admin.
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

      {transactions.length === 0 ? (
        <div className="glass-card" style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Clock size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>
              Tidak ada transaksi aktif
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Semua pengajuan Anda telah selesai diverifikasi atau Anda belum membuat pengajuan.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {transactions.map((tx) => {
            const selectedMethod = paymentSelections[tx.id] || tx.paymentMethod;
            const isWaiting = tx.status === 'WAITING_VERIFICATION';

            return (
              <div key={tx.id} className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                borderLeft: isWaiting ? '4px solid #f59e0b' : '4px solid #059669'
              }}>
                {/* Upper Section: Details */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingBottom: '1rem'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      No. Transaksi
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: 'white', fontFamily: 'var(--font-title)', marginTop: '0.15rem' }}>
                      {tx.transactionNumber}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Dibuat pada: {new Date(tx.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isWaiting ? (
                      <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Menunggu Verifikasi
                      </span>
                    ) : (
                      <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CreditCard size={12} /> Belum Bayar
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Section: Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  {/* Photo & Specs */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {tx.trashPhoto?.imageUrl ? (
                      <img
                        src={tx.trashPhoto.imageUrl}
                        alt="Foto Sampah"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '0.5rem',
                          objectFit: 'cover',
                          border: '1px solid var(--glass-border)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}>
                        No Photo
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detail Pengajuan</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tx.trashType.name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {tx.region.name} • <strong style={{ color: 'white' }}>{tx.weight} kg</strong>
                      </span>
                    </div>
                  </div>

                  {/* Payment flow block */}
                  {!isWaiting ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Pilih Rekening Pembayaran:
                      </span>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSelectPayment(tx.id, 'BCA')}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: selectedMethod === 'BCA' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            color: selectedMethod === 'BCA' ? 'var(--accent)' : 'var(--text-secondary)',
                            border: selectedMethod === 'BCA' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          BCA
                        </button>
                        <button
                          onClick={() => handleSelectPayment(tx.id, 'SEABANK')}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: selectedMethod === 'SEABANK' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            color: selectedMethod === 'SEABANK' ? 'var(--accent)' : 'var(--text-secondary)',
                            border: selectedMethod === 'SEABANK' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          Seabank
                        </button>
                      </div>

                      {/* Display account number */}
                      {selectedMethod && (
                        <div style={{
                          marginTop: '0.25rem',
                          padding: '0.65rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          lineHeight: '1.4'
                        }}>
                          <div>Bank: <strong style={{ color: 'white' }}>{selectedMethod}</strong></div>
                          <div>No. Rekening: <strong style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                            {selectedMethod === 'BCA' ? '123-456-7890' : '987-654-3210'}
                          </strong></div>
                          <div>Atas Nama: <strong style={{ color: 'white' }}>Serabin Admin</strong></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      background: 'rgba(245, 158, 11, 0.05)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Clock size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
                          Menunggu Konfirmasi
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Pembayaran via <strong>{tx.paymentMethod}</strong> sedang dicek oleh admin. Pengajuan Anda akan diproses setelah pembayaran diverifikasi.
                      </p>
                    </div>
                  )}
                </div>

                {/* Lower Action Section */}
                {!isWaiting && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                    paddingTop: '1rem'
                  }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleConfirmPayment(tx.id)}
                      disabled={!selectedMethod || submittingId === tx.id}
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}
                    >
                      {submittingId === tx.id ? 'Mengonfirmasi...' : 'Saya Sudah Bayar (Selesai)'}
                      <Check size={16} />
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
