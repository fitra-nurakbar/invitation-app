'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Layers } from 'lucide-react';

export default function PaymentSuccessPage() {
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
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            borderRadius: 0,
          }}
        >
          <CheckCircle2 size={28} strokeWidth={1.75} />
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
          Pembayaran Berhasil
        </h1>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--text-muted, #6b665f)',
            lineHeight: 1.6,
            margin: '0 0 28px',
          }}
        >
          Terima kasih. Pembayaran template undangan telah berhasil diverifikasi. Template kini
          sudah aktif pada akun Anda dan siap untuk digunakan.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/dashboard/invitations/create"
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
            <span>Mulai Buat Undangan</span>
            <ArrowRight size={15} strokeWidth={1.75} />
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
            <Layers size={15} strokeWidth={1.75} />
            <span>Lihat Template Saya</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
