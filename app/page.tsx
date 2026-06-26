'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface Template {
  id: string
  name: string
  price: number
  is_active: boolean
  order_deadline_days: number
  active_days_after: number
}

// Fetch templates tanpa auth — perlu endpoint public di backend
async function fetchPublicTemplates(): Promise<Template[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/public`)
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPublicTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false))
  }, [])

  // Parallax subtle pada hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`

  return (
    <div className={styles.page}>

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>💌 Invitation</span>
        <div className={styles.navLinks}>
          <a href="#templates" className={styles.navLink}>Template</a>
          <a href="#cara-kerja" className={styles.navLink}>Cara Kerja</a>
          <Link href="/auth/login" className={styles.navCta}>
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} ref={heroRef} />

        <div className={styles.heroContent}>
          {/* Signature element: preview undangan animasi */}
          <div className={styles.invitationPreview}>
            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>Undangan Pernikahan</p>
              <div className={styles.previewNames}>
                <span className={styles.previewName}>Budi</span>
                <span className={styles.previewAnd}>&</span>
                <span className={styles.previewName}>Ani</span>
              </div>
              <p className={styles.previewDate}>Sabtu, 25 Desember 2025</p>
              <div className={styles.previewDivider} />
              <p className={styles.previewVenue}>Gedung Serbaguna Merdeka, Jakarta</p>
            </div>
          </div>

          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Undangan Digital</p>
            <h1 className={styles.heroTitle}>
              Momen Spesial,<br />
              <em>Dirayakan Bersama</em>
            </h1>
            <p className={styles.heroSubtitle}>
              Buat undangan pernikahan digital yang indah. Bagikan ke semua tamu
              hanya dengan satu tautan — tanpa kertas, tanpa batas.
            </p>
            <div className={styles.heroActions}>
              <Link href="/auth/login" className={styles.heroBtnPrimary}>
                Buat Undangan Sekarang
              </Link>
              <a href="#templates" className={styles.heroBtnSecondary}>
                Lihat Template
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>500+</span>
                <span className={styles.heroStatLabel}>Undangan Dibuat</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>50K+</span>
                <span className={styles.heroStatLabel}>Tamu Hadir</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>4.9★</span>
                <span className={styles.heroStatLabel}>Rating Pengguna</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Templates ──────────────────────────────────────── */}
      <section className={styles.templates} id="templates">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Koleksi Template</p>
            <h2 className={styles.sectionTitle}>Pilih Desain yang Sesuai Momenmu</h2>
            <p className={styles.sectionSubtitle}>
              Setiap template dirancang dengan penuh perhatian untuk merayakan
              hari istimewa kamu
            </p>
          </div>

          {loading ? (
            <div className={styles.templateGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.templateSkeleton} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            // Fallback jika endpoint belum ada — tampilkan template dummy
            <div className={styles.templateGrid}>
              {templates.map(t => (
                <TemplateCard key={t.id} template={t} formatPrice={formatPrice} />
              ))}
            </div>
          ) : (
            <div className={styles.templateGrid}>
              {templates.map(t => (
                <TemplateCard key={t.id} template={t} formatPrice={formatPrice} />
              ))}
            </div>
          )}

          <div className={styles.templatesCta}>
            <Link href="/auth/login" className={styles.heroBtnPrimary}>
              Pilih Template & Mulai
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Cara Kerja ─────────────────────────────────────── */}
      <section className={styles.howItWorks} id="cara-kerja">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Mudah & Cepat</p>
            <h2 className={styles.sectionTitle}>Siap dalam 3 Langkah</h2>
          </div>

          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepConnector} />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fitur ──────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Rayakan Momenmu<br />dengan Cara Terbaik
          </h2>
          <p className={styles.ctaSubtitle}>
            Bergabung dengan ribuan pasangan yang sudah mempercayakan
            undangan digital mereka kepada kami
          </p>
          <Link href="/auth/login" className={styles.ctaBtn}>
            Buat Undangan Gratis →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>💌 Invitation</span>
              <p className={styles.footerTagline}>
                Platform undangan digital terpercaya untuk momen istimewamu
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerLinkGroup}>
                <h4 className={styles.footerLinkTitle}>Produk</h4>
                <a href="#templates" className={styles.footerLink}>Template</a>
                <a href="#cara-kerja" className={styles.footerLink}>Cara Kerja</a>
                <Link href="/auth/login" className={styles.footerLink}>Mulai Gratis</Link>
              </div>
              <div className={styles.footerLinkGroup}>
                <h4 className={styles.footerLinkTitle}>Akun</h4>
                <Link href="/auth/login" className={styles.footerLink}>Masuk</Link>
                <Link href="/auth/login" className={styles.footerLink}>Daftar</Link>
                <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 Invitation App. Dibuat dengan ❤️ di Indonesia</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ─── Sub Components ───────────────────────────────────────────

function TemplateCard({ template, formatPrice }: {
  template: Template
  formatPrice: (p: number) => string
}) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  const idx = template.name.length % gradients.length

  return (
    <div className={styles.templateCard}>
      <div
        className={styles.templatePreview}
        style={{ background: gradients[idx] }}
      >
        <div className={styles.templatePreviewContent}>
          <p className={styles.templatePreviewLabel}>Undangan Pernikahan</p>
          <p className={styles.templatePreviewTitle}>{template.name}</p>
        </div>
        {template.price === 0 && (
          <span className={styles.templateFreeBadge}>Gratis</span>
        )}
      </div>
      <div className={styles.templateCardBody}>
        <h3 className={styles.templateName}>{template.name}</h3>
        <div className={styles.templateMeta}>
          <span>Aktif {template.active_days_after} hari</span>
          <span>·</span>
          <span>Order max {template.order_deadline_days} hari sebelum</span>
        </div>
        <div className={styles.templateCardFooter}>
          <span className={styles.templatePrice}>{formatPrice(template.price)}</span>
          <Link href="/auth/login" className={styles.templateBtn}>
            Pilih Template
          </Link>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    icon: '🎨',
    title: 'Pilih Template',
    desc: 'Jelajahi koleksi template kami dan pilih yang paling sesuai dengan tema pernikahanmu',
  },
  {
    icon: '✏️',
    title: 'Isi Detail Acara',
    desc: 'Masukkan nama, tanggal, lokasi, dan detail acara lainnya dengan mudah',
  },
  {
    icon: '📨',
    title: 'Bagikan ke Tamu',
    desc: 'Salin link undangan dan bagikan ke semua tamu lewat WhatsApp, Instagram, atau email',
  },
]

const FEATURES = [
  {
    icon: '📱',
    title: 'Tampil Sempurna di Semua Perangkat',
    desc: 'Undangan dioptimalkan untuk mobile, tablet, dan desktop',
  },
  {
    icon: '💬',
    title: 'Buku Tamu Digital',
    desc: 'Tamu bisa mengirim ucapan langsung di halaman undangan',
  },
  {
    icon: '🗺️',
    title: 'Peta Lokasi Terintegrasi',
    desc: 'Tamu mudah menemukan lokasi acara dengan Google Maps',
  },
  {
    icon: '🔗',
    title: 'Link Unik & Mudah Dibagikan',
    desc: 'Setiap undangan punya URL cantik yang mudah diingat',
  },
  {
    icon: '⚡',
    title: 'Aktif Instan',
    desc: 'Undangan langsung aktif setelah pembayaran — tanpa proses panjang',
  },
  {
    icon: '🔒',
    title: 'Aman & Terpercaya',
    desc: 'Data kamu terlindungi dengan enkripsi dan sistem keamanan modern',
  },
]