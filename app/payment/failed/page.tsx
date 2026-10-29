'use client';

import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #faf9f6)',
        padding: '24px',
        color: 'var(--text-main, #181716)',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e4dfd5)',
          borderRadius: 0,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            borderRadius: 0,
          }}
        >
          <AlertCircle size={28} strokeWidth={1.75} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-main, #181716)',
            margin: '0 0 10px',
          }}
        >
          Pembayaran Tidak Berhasil
        </h1>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--text-muted, #6b665f)',
            lineHeight: 1.6,
            margin: '0 0 28px',
          }}
        >
          Pembayaran dibatalkan atau batas waktu pembayaran telah habis. Anda dapat mengulangi
          proses pembayaran kapan saja.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/dashboard/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'var(--text-main, #181716)',
              color: '#ffffff',
              border: '1px solid var(--text-main, #181716)',
              borderRadius: 0,
              fontWeight: 600,
              fontSize: '13.5px',
              letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            <RotateCcw size={15} strokeWidth={1.75} />
            <span>Coba Lagi dari Riwayat Pesanan</span>
          </Link>

          <Link
            href="/dashboard/templates"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 20px',
              background: 'transparent',
              color: 'var(--text-main, #181716)',
              border: '1px solid var(--border-light, #e4dfd5)',
              borderRadius: 0,
              fontWeight: 500,
              fontSize: '13.5px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
            <span>Kembali ke Katalog Template</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
