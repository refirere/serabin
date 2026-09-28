'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, MapPin, Scale, Image as ImageIcon, CheckCircle, AlertTriangle, Send } from 'lucide-react';

interface TrashType {
  id: string;
  name: string;
  slot: number;
  description: string | null;
}

interface Region {
  id: string;
  name: string;
  slot: number;
}

interface WeightSetting {
  minWeight: number;
  maxWeight: number;
}

export default function UserDashboard() {
  const router = useRouter();

  // Data states
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [weightSetting, setWeightSetting] = useState<WeightSetting>({ minWeight: 0.5, maxWeight: 50.0 });
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');

  // UI status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [typesRes, regionsRes, weightRes] = await Promise.all([
          fetch('/api/admin/trash-types'),
          fetch('/api/admin/regions'),
          fetch('/api/admin/weight-setting')
        ]);

        if (typesRes.ok && regionsRes.ok && weightRes.ok) {
          const typesData = await typesRes.json();
          const regionsData = await regionsRes.json();
          const weightData = await weightRes.json();

          setTrashTypes(typesData);
          setRegions(regionsData);
          setWeightSetting(weightData);
        } else {
          setErrorMsg('Gagal memuat data formulir. Harap muat ulang halaman.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Terjadi kesalahan koneksi saat memuat data.');
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Convert uploaded image to base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 2MB');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.onerror = (err) => {
      console.error(err);
      setErrorMsg('Gagal memproses file gambar');
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedType) {
      setErrorMsg('Pilih jenis sampah terlebih dahulu');
      return;
    }
    if (!selectedRegion) {
      setErrorMsg('Pilih wilayah penjemputan/penyerahan terlebih dahulu');
      return;
    }
    if (!weight) {
      setErrorMsg('Masukkan berat sampah');
      return;
    }

    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight < weightSetting.minWeight || numWeight > weightSetting.maxWeight) {
      setErrorMsg(`Berat sampah harus antara ${weightSetting.minWeight} kg dan ${weightSetting.maxWeight} kg`);
      return;
    }

    if (!photoBase64) {
      setErrorMsg('Unggah foto sampah terlebih dahulu');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/user/submit-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trashTypeId: selectedType,
          regionId: selectedRegion,
          weight: numWeight,
          photoBase64,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Pengajuan pemilahan sampah berhasil disubmit!');
        // Clear form
        setSelectedType('');
        setSelectedRegion('');
        setWeight('');
        setPhotoBase64('');
        setPhotoName('');
        
        // Redirect to active transactions to proceed to payment
        setTimeout(() => {
          router.push('/user/transactions');
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Gagal menyimpan pengajuan');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan sistem saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
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
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-title)' }}>
          Formulir Pemilahan Sampah
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Silakan lengkapi formulir di bawah ini untuk mengajukan pemilahan sampah Anda ke sistem Serabin.
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* 1. Select Trash Type */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={18} className="text-secondary" style={{ color: 'var(--accent)' }} />
            1. Pilih Jenis Sampah
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem'
          }}>
            {trashTypes.map((type) => {
              const isOutOfSlot = type.slot <= 0;
              const isSelected = selectedType === type.id;
              
              return (
                <div
                  key={type.id}
                  onClick={() => {
                    if (!isOutOfSlot && !submitting) setSelectedType(type.id);
                  }}
                  style={{
                    border: isSelected 
                      ? '2px solid var(--accent)' 
                      : isOutOfSlot 
                        ? '1px solid rgba(255, 255, 255, 0.03)' 
                        : '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: isOutOfSlot ? 'not-allowed' : 'pointer',
                    opacity: isOutOfSlot ? 0.35 : 1,
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '110px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{type.name}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                      {type.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    {isOutOfSlot ? (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        display: 'inline-block'
                      }}>
                        slot habis
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.75rem',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: 500
                      }}>
                        {type.slot} slot tersedia
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Select Region */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} style={{ color: 'var(--accent)' }} />
            2. Pilih Wilayah Penjemputan
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {regions.map((reg) => {
              const isOutOfSlot = reg.slot <= 0;
              const isSelected = selectedRegion === reg.id;
              
              return (
                <div
                  key={reg.id}
                  onClick={() => {
                    if (!isOutOfSlot && !submitting) setSelectedRegion(reg.id);
                  }}
                  style={{
                    border: isSelected 
                      ? '2px solid var(--accent)' 
                      : isOutOfSlot 
                        ? '1px solid rgba(255, 255, 255, 0.03)' 
                        : '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: isOutOfSlot ? 'not-allowed' : 'pointer',
                    opacity: isOutOfSlot ? 0.35 : 1,
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '80px'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reg.name}</span>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    {isOutOfSlot ? (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        display: 'inline-block'
                      }}>
                        slot habis
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.75rem',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: 500
                      }}>
                        {reg.slot} slot tersedia
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Weight & 4. Photo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Weight input */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} style={{ color: 'var(--accent)' }} />
              3. Tentukan Berat Sampah
            </h3>
            
            <div className="form-group">
              <label className="form-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                <span>Berat Sampah (kg)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Batas: {weightSetting.minWeight} - {weightSetting.maxWeight} kg
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={`Contoh: 2.5`}
                className="form-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={submitting}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                *Masukkan berat riil sampah Anda sesuai ketentuan.
              </p>
            </div>
          </div>

          {/* Photo input */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
              4. Foto Sampah
            </h3>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Upload Foto Sampah Anda</label>
              
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.01)',
                transition: 'border-color 0.2s ease',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  disabled={submitting}
                />
                
                {photoBase64 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={photoBase64}
                      alt="Preview"
                      style={{
                        maxWidth: '120px',
                        maxHeight: '120px',
                        borderRadius: '0.5rem',
                        objectFit: 'cover',
                        border: '1px solid var(--accent)'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {photoName || 'Foto Terunggah'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={32} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Klik atau seret file gambar ke sini
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Maksimal 2MB (PNG, JPG)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit action button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{
            alignSelf: 'center',
            padding: '1rem 3rem',
            fontSize: '1.05rem',
            width: '100%',
            maxWidth: '300px',
            marginTop: '1rem'
          }}
        >
          {submitting ? 'Mengirim Data...' : 'Kirim Pengajuan'}
          {!submitting && <Send size={18} />}
        </button>

      </form>
    </div>
  );
}
