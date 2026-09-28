'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { Leaf, PlusCircle, CreditCard, History, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';

interface DashboardStats {
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  totalWeight: number;
}

export default function UserDashboardHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/user/dashboard-stats');
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

  const quickActions = [
    { label: 'Pilah Sampah', href: '/user', icon: PlusCircle, color: '#10b981' },
    { label: 'Transaksi Aktif', href: '/user/transactions', icon: CreditCard, color: '#f59e0b' },
    { label: 'Riwayat', href: '/user/history', icon: History, color: '#3b82f6' },
  ];

  const statCards = [
    { label: 'Total Transaksi', value: stats?.totalTransactions || 0, icon: CheckCircle, color: '#10b981' },
    { label: 'Proses', value: stats?.pendingTransactions || 0, icon: Clock, color: '#f59e0b' },
    { label: 'Selesai', value: stats?.approvedTransactions || 0, icon: Award, color: '#3b82f6' },
    { label: 'Total Sampah', value: `${(stats?.totalWeight || 0).toFixed(1)} kg`, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-title)' }}>
          Selamat Datang, {user?.name || 'User'}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Mulai pemilahan sampah Anda atau lihat transaksi terbaru di sini.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              onClick={() => router.push(action.href)}
              className="glass-card"
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div style={{
                background: `rgba(${action.color.replace('#', '')}, 0.1)`,
                padding: '0.75rem',
                borderRadius: '1rem',
                display: 'inline-flex',
                marginBottom: '0.5rem',
                color: action.color
              }}>
                <Icon size={28} />
              </div>
              <div style={{ fontWeight: 600, color: 'white' }}>{action.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>
          Transaksi Terbaru Anda
        </h3>
        {recentTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
            Belum ada transaksi. Mulai pilah sampah sekarang!
          </p>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Jenis Sampah</th>
                  <th>Berat</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tx.transactionNumber}</td>
                    <td>{tx.trashType?.name || '-'}</td>
                    <td>{tx.weight} kg</td>
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