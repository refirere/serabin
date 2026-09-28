'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Trash2, MapPin, Scale, Shield, Users, ArrowRight, CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0b0f19'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      {/* ===== NAVBAR ===== */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 1.5rem'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Brand */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
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
          </Link>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/login"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Masuk
            </Link>
            <Link
              href="/login?register=true"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'white',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                border: 'none',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        padding: '4rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decoration */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)',
          top: '-20%',
          left: '-10%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          bottom: '-20%',
          right: '-10%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.15)'
          }}>
            <Leaf size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              Platform Pemilahan Sampah Modern
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-title)',
            background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            Kelola Sampah dengan <br />
            <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mudah & Terpercaya
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 2rem',
            lineHeight: 1.7
          }}>
            Serabin membantu Anda memilah sampah dengan sistem yang transparan, 
            terintegrasi, dan ramah lingkungan. Daftar sekarang dan mulai kontribusi 
            untuk lingkungan yang lebih bersih!
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login?register=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'white',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              Mulai Sekarang
              <ArrowRight size={20} />
            </Link>
            <Link
              href="#features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none'
              }}
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>100+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pengguna Aktif</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>50+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transaksi Selesai</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>5</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wilayah Terdaftar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: '4rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Fitur Unggulan Serabin
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Semua kebutuhan pemilahan sampah Anda dalam satu platform
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { icon: Trash2, title: 'Multi Jenis Sampah', desc: 'Pilih dari berbagai jenis sampah organik, anorganik, B3, dan lainnya.' },
              { icon: MapPin, title: 'Cakupan Wilayah', desc: 'Daftar wilayah penjemputan yang terus berkembang di seluruh kota.' },
              { icon: Scale, title: 'Harga Transparan', desc: 'Harga per kg yang jelas dan total biaya yang dihitung otomatis.' },
              { icon: Shield, title: 'Verifikasi Admin', desc: 'Setiap transaksi diverifikasi oleh admin untuk keamanan dan kepercayaan.' },
              { icon: Users, title: 'Multi User Role', desc: 'Peran Admin dan User dengan akses dan fitur yang berbeda.' },
              { icon: Clock, title: 'Riwayat Lengkap', desc: 'Lihat semua riwayat transaksi Anda yang sudah selesai.' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="glass-card" style={{ textAlign: 'center', padding: '1.75rem' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    display: 'inline-flex',
                    marginBottom: '1rem',
                    color: '#10b981'
                  }}>
                    <Icon size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>{feature.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '3rem 2rem',
          border: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Siap Memulai Pemilahan Sampah?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
            Bergabunglah dengan Serabin dan bantu lingkungan menjadi lebih bersih.
          </p>
          <Link
            href="/login?register=true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2.5rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'white',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            Daftar Gratis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: '2rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Beranda</Link>
            <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Masuk</Link>
            <Link href="/login?register=true" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Daftar</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} Serabin - Platform Pemilahan Sampah Modern
          </p>
        </div>
      </footer>
    </div>
  );
}