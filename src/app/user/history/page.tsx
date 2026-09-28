'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Calendar, CheckCircle2, XCircle, DollarSign, Scale, FileText } from 'lucide-react';

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

interface Transaction {
  id: string;
  transactionNumber: string;
  weight: number;
  totalPrice: number;
  paymentMethod: string | null;
  paymentStatus: string;
  status: string;
  createdAt: string;
  trashType: TrashType;
  region: Region;
  trashPhoto: TrashPhoto | null;
}

export default function UserHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/user/transactions');
        if (res.ok) {
          const data = await res.json();
          const completed = data.filter((t: Transaction) => t.status === 'APPROVED' || t.status === 'REJECTED');
          setTransactions(completed);
        } else {
          setErrorMsg('Gagal mengambil riwayat transaksi.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Kesalahan koneksi saat memuat riwayat.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

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
          Riwayat Pemilahan Sampah
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Daftar seluruh transaksi pemilahan sampah Anda yang telah selesai diproses oleh admin.
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
          <History size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>
              Belum ada riwayat transaksi
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Transaksi Anda yang telah selesai (disetujui atau ditolak) akan muncul di sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Tanggal</th>
                  <th>Spesifikasi Sampah</th>
                  <th>Wilayah</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isApproved = tx.status === 'APPROVED';

                  return (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 600, color: 'white' }}>
                        {tx.transactionNumber}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {tx.trashPhoto?.imageUrl && (
                            <img
                              src={tx.trashPhoto.imageUrl}
                              alt="Trash"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.25rem',
                                objectFit: 'cover',
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 500 }}>{tx.trashType.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Scale size={10} /> {tx.weight} kg
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{tx.region.name}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        Rp {tx.totalPrice.toLocaleString('id-ID')}
                      </td>
                      <td>
                        {isApproved ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Disetujui
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <XCircle size={12} /> Ditolak
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isApproved && (
                          <button
                            onClick={() => router.push(`/user/invoice/${tx.id}`)}
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              cursor: 'pointer',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '0.4rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s',
                              fontFamily: 'inherit'
                            }}
                          >
                            <FileText size={14} /> Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}