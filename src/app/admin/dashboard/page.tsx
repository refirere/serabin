'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { Leaf, Users, Trash2, MapPin, Scale, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  pendingVerifications: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  totalRevenue: number;
  trashTypesCount: number;
  regionsCount: number;
}

export default function AdminDashboardHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/user/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/admin/dashboard-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentTransactions(data.recentTransactions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    }
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading || loadingStats) {
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

  const statCards = [
    { label: 'Total Pengguna', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6' },
    { label: 'Total Transaksi', value: stats?.totalTransactions || 0, icon: CheckCircle, color: '#10b981' },
    { label: 'Menunggu Verifikasi', value: stats?.pendingVerifications || 0, icon: Clock, color: '#f59e0b' },
    { label: 'Total Revenue', value: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: '#8b5cf6' },
    { label: 'Jenis Sampah', value: stats?.trashTypesCount || 0, icon: Trash2, color: '#ec4899' },
    { label: 'Wilayah', value: stats?.regionsCount || 0, icon: MapPin, color: '#06b6d4' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>
          Selamat Datang, {user?.name || 'Admin'}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Ini adalah dashboard admin Serabin. Kelola semua aspek aplikasi dari sini.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{
                background: `rgba(${card.color.replace('#', '')}, 0.1)`,
                padding: '0.5rem',
                borderRadius: '0.75rem',
                display: 'inline-flex',
                marginBottom: '0.5rem',
                color: card.color
              }}>
                <Icon size={24} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>
          Transaksi Terbaru
        </h3>
        {recentTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
            Belum ada transaksi terbaru.
          </p>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>User</th>
                  <th>Jenis Sampah</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tx.transactionNumber}</td>
                    <td>{tx.user?.name || '-'}</td>
                    <td>{tx.trashType?.name || '-'}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      Rp {tx.totalPrice?.toLocaleString('id-ID') || 0}
                    </td>
                    <td>
                      <span className={`badge ${tx.status === 'APPROVED' ? 'badge-success' : tx.status === 'REJECTED' ? 'badge-danger' : tx.status === 'WAITING_VERIFICATION' ? 'badge-warning' : 'badge-info'}`}>
                        {tx.status === 'APPROVED' ? 'Disetujui' : tx.status === 'REJECTED' ? 'Ditolak' : tx.status === 'WAITING_VERIFICATION' ? 'Menunggu' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}