import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Invitation App',
  description: 'Buat undangan digital yang indah',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
