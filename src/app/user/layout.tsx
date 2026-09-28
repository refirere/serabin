import React from 'react';
import { getSessionUser } from '../../lib/auth';
import { redirect } from 'next/navigation';
import UserSidebar from './UserSidebar';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <UserSidebar userEmail={user.email} userName={user.name} />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2rem 1.5rem',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          main { margin-left: 0 !important; padding: 1rem; }
        }
      `}</style>
    </div>
  );
}