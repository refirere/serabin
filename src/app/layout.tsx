import './global.css';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'Serabin - Aplikasi Pemilahan Sampah Modern',
  description: 'Kelola pemilahan sampah dengan mudah, transparan, dan terpercaya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
