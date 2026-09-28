'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { 
  LayoutDashboard, PlusCircle, CreditCard, History, 
  LogOut, Leaf, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

interface UserSidebarProps {
  userEmail: string;
  userName: string;
}

export default function UserSidebar({ userEmail, userName }: UserSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Pilah Sampah', href: '/user', icon: PlusCircle },
    { name: 'Transaksi Aktif', href: '/user/transactions', icon: CreditCard },
    { name: 'Riwayat', href: '/user/history', icon: History },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="sidebar-toggle"
        style={{
          position: 'fixed',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          color: 'white',
          padding: '0.5rem',
          cursor: 'pointer',
        }}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '260px',
          minHeight: '100vh',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/user/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: 'white',
            fontFamily: 'var(--font-title)',
            textDecoration: 'none'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              padding: '0.4rem',
              borderRadius: '0.5rem',
              display: 'flex'
            }}>
              <Leaf size={20} color="white" />
            </div>
            <span>Serabin</span>
            <span style={{
              fontSize: '0.6rem',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              padding: '0.15rem 0.4rem',
              borderRadius: '0.25rem',
              marginLeft: 'auto',
              fontWeight: 'bold'
            }}>USER</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? '#10b981' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                  marginBottom: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {userName}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {userEmail}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      <style>{`
        /* Desktop: sidebar always visible */
        .sidebar {
          transform: translateX(0);
        }
        
        /* Mobile: sidebar hidden by default */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-toggle {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
        
        /* Desktop: hide toggle and overlay */
        @media (min-width: 769px) {
          .sidebar-toggle {
            display: none !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .sidebar {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}