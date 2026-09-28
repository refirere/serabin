'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setFormLoading(true);

    if (isRegister) {
      if (!name || !email || !password || !confirmPassword) {
        setErrorMsg('Semua field wajib diisi');
        setFormLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Password konfirmasi tidak cocok');
        setFormLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password minimal harus 6 karakter');
        setFormLoading(false);
        return;
      }

      const res = await register(name, email, password);
      if (res.success) {
        setSuccessMsg('Registrasi berhasil! Mengarahkan ke login...');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsRegister(false);
          setSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(res.error || 'Registrasi gagal. Coba lagi.');
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Email dan password wajib diisi');
        setFormLoading(false);
        return;
      }

      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Login sukses! Mengarahkan...');
      } else {
        setErrorMsg(res.error || 'Email atau password salah');
      }
    }
    setFormLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        zIndex: 1,
        position: 'relative',
        padding: '2.5rem'
      }}>
        {/* Brand Logo Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            padding: '0.75rem',
            borderRadius: '1rem',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Leaf size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            background: 'linear-gradient(135deg, #fff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: '0.5rem'
          }}>Serabin</h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {isRegister 
              ? 'Daftar akun untuk memilah sampah bersama kami' 
              : 'Masuk ke portal pemilahan sampah pintar'}
          </p>
        </div>

        {/* Form Alerts */}
        {errorMsg && (
          <div style={{
            background: 'var(--error-bg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            color: 'var(--error)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
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
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                <User size={16} /> Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formLoading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} /> Alamat Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={formLoading}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">
              <Lock size={16} /> Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={formLoading}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} /> Konfirmasi Kata Sandi
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={formLoading}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={formLoading}
            style={{ marginTop: '1.25rem', width: '100%', padding: '0.85rem' }}
          >
            {formLoading ? 'Memproses...' : isRegister ? 'Registrasi Akun' : 'Masuk Sekarang'}
            {!formLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          {isRegister ? (
            <>
              Sudah punya akun?{' '}
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Masuk
              </button>
            </>
          ) : (
            <>
              Belum punya akun?{' '}
              <button
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Daftar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}