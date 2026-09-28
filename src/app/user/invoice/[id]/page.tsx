'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../lib/AuthContext';
import { Leaf, Download, Printer, Calendar, User, MapPin, Scale, FileText, CheckCircle, Trash2 } from 'lucide-react';

interface InvoiceData {
  id: string;
  transactionNumber: string;
  createdAt: string;
  weight: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  trashType: {
    name: string;
    pricePerKg: number;
  };
  region: {
    name: string;
  };
  trashPhoto: {
    imageUrl: string;
  } | null;
}

export default function InvoicePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      try {
        const res = await fetch(`/api/user/invoice/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        } else {
          const err = await res.json();
          setErrorMsg(err.error || 'Gagal memuat invoice');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Terjadi kesalahan koneksi');
      } finally {
        setLoadingInvoice(false);
      }
    }
    if (user) {
      loadInvoice();
    }
  }, [id, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || loadingInvoice) {
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

  if (errorMsg || !invoice) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--error)', fontSize: '1.1rem' }}>
          {errorMsg || 'Invoice tidak ditemukan'}
        </p>
        <button
          onClick={() => router.push('/user/history')}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Invoice Card */}
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              display: 'flex'
            }}>
              <Leaf size={28} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>Serabin</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Pemilahan Sampah</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              <CheckCircle size={12} /> LUNAS
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {invoice.transactionNumber}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tanggal Transaksi
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <span>{new Date(invoice.createdAt).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Metode Pembayaran
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
              {invoice.paymentMethod || 'BCA'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Status
            </div>
            <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>
              Selesai
            </span>
          </div>
        </div>

        {/* User & Detail */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              <User size={14} /> Pengguna
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{invoice.user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{invoice.user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              <Trash2 size={14} /> Jenis Sampah
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{invoice.trashType.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              <MapPin size={14} /> Wilayah
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{invoice.region.name}</div>
          </div>
        </div>

        {/* Detail Barang */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Detail Sampah</h3>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0.75rem',
            padding: '1rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Berat</span>
                <div style={{ fontWeight: 600 }}>{invoice.weight} kg</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Harga per Kg</span>
                <div style={{ fontWeight: 600 }}>Rp {invoice.trashType.pricePerKg.toLocaleString('id-ID')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                  Rp {invoice.totalPrice.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo */}
        {invoice.trashPhoto?.imageUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Foto Sampah</span>
            <div style={{
              marginTop: '0.5rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              maxWidth: '200px'
            }}>
              <img
                src={invoice.trashPhoto.imageUrl}
                alt="Sampah"
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Terima kasih telah berkontribusi untuk lingkungan 🌿
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Printer size={16} /> Cetak
            </button>
            <button
              onClick={() => router.push('/user/history')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              Kembali ke Riwayat
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .glass-card, .glass-card * { visibility: visible; }
          .glass-card { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; border: none; }
          .btn, .btn-secondary, .btn-primary { display: none; }
        }
      `}</style>
    </div>
  );
}