'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Layers,
  Edit3,
  Share2,
  Smartphone,
  MessageSquare,
  MapPin,
  Globe,
  Zap,
  ShieldCheck,
  ArrowRight,
  ArrowUp,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import styles from './page.module.css';

interface Template {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  order_deadline_days: number;
  active_days_after: number;
}

async function fetchPublicTemplates(): Promise<Template[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiUrl}/templates/public`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 860) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetchPublicTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${y * 0.25}px)`;
      }
      setShowScrollTop(y > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const elem = document.getElementById(targetId);
    if (elem) {
      const navOffset = 76;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const handleScrollToTop = () => {
    setMobileMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isLoggedIn = mounted && !authLoading && isAuthenticated;
  const dashboardHref = user?.role === 'admin' ? '/admin' : '/dashboard';
  const createHref = user?.role === 'admin' ? '/admin' : '/dashboard/invitations/create';

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;

  return (
    <div className={styles.page}>
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span
            className={styles.navLogo}
            onClick={handleScrollToTop}
            style={{ cursor: 'pointer' }}
            title="Kembali ke atas"
          >
            INVITATION
          </span>

          {/* Desktop Navigation (>= 860px) */}
          <div className={styles.navDesktopLinks}>
            <a
              href="#templates"
              className={styles.navLink}
              onClick={e => handleSmoothScroll(e, 'templates')}
            >
              Template
            </a>
            <a
              href="#cara-kerja"
              className={styles.navLink}
              onClick={e => handleSmoothScroll(e, 'cara-kerja')}
            >
              Cara Kerja
            </a>
            <a
              href="#fitur"
              className={styles.navLink}
              onClick={e => handleSmoothScroll(e, 'fitur')}
            >
              Keunggulan
            </a>

            {isLoggedIn ? (
              <div className={styles.navAuthGroup}>
                <Link
                  href={dashboardHref}
                  className={styles.navUserPill}
                  title={`Masuk sebagai ${user?.name || 'Pengguna'}`}
                >
                  <div className={styles.navUserAvatar}>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        className={styles.navAvatarImg}
                      />
                    ) : (
                      <span>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className={styles.navUserName}>{user?.name?.split(' ')[0] || 'Akun'}</span>
                </Link>
                <Link href={dashboardHref} className={styles.navCta}>
                  <LayoutDashboard size={14} strokeWidth={2} />
                  <span>{user?.role === 'admin' ? 'Portal Admin' : 'Dashboard'}</span>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login" className={styles.navCta}>
                Masuk / Daftar
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (< 860px) */}
          <div className={styles.navMobileControls}>
            {!isLoggedIn && (
              <Link href="/auth/login" className={styles.navMobileCta}>
                Masuk
              </Link>
            )}

            <button
              type="button"
              className={styles.navToggleBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={19} strokeWidth={1.75} />
              ) : (
                <Menu size={19} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <div
          className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className={styles.mobileMenuInner}>
            <div className={styles.mobileNavLinks}>
              <a
                href="#templates"
                className={styles.mobileNavLink}
                onClick={e => handleSmoothScroll(e, 'templates')}
              >
                <span>Koleksi Template</span>
                <span className={styles.mobileNavIndex}>01</span>
              </a>
              <a
                href="#cara-kerja"
                className={styles.mobileNavLink}
                onClick={e => handleSmoothScroll(e, 'cara-kerja')}
              >
                <span>Cara Kerja</span>
                <span className={styles.mobileNavIndex}>02</span>
              </a>
              <a
                href="#fitur"
                className={styles.mobileNavLink}
                onClick={e => handleSmoothScroll(e, 'fitur')}
              >
                <span>Keunggulan & Fitur</span>
                <span className={styles.mobileNavIndex}>03</span>
              </a>
            </div>

            <div className={styles.mobileMenuDivider} />

            <div className={styles.mobileAuthBox}>
              {isLoggedIn ? (
                <div className={styles.mobileUserCard}>
                  <div className={styles.mobileUserInfo}>
                    <div className={styles.mobileUserAvatar}>
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || 'User'}
                          className={styles.navAvatarImg}
                        />
                      ) : (
                        <span>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.mobileUserMeta}>
                      <span className={styles.mobileUserName}>{user?.name || 'Pengguna'}</span>
                      <span className={styles.mobileUserEmail}>{user?.email}</span>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    className={styles.mobileFullCta}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} strokeWidth={2} />
                    <span>
                      {user?.role === 'admin' ? 'Buka Panel Admin' : 'Buka Dashboard Undangan'}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className={styles.mobileGuestBox}>
                  <p className={styles.mobileGuestHint}>
                    Rancang undangan pernikahan digital klasik dengan elegan.
                  </p>
                  <Link
                    href="/auth/login"
                    className={styles.mobileFullCta}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Masuk atau Buat Akun</span>
                    <ArrowRight size={15} strokeWidth={2} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className={styles.navBackdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} ref={heroRef} />

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Undangan Pernikahan Digital</p>
            <h1 className={styles.heroTitle}>
              Keanggunan Abadi,
              <br />
              <em>Dihadirkan Secara Digital</em>
            </h1>
            <p className={styles.heroSubtitle}>
              Rancang undangan pernikahan bergaya klasik dengan tipografi elegan. Bagikan
              kebahagiaan Anda kepada seluruh kerabat dengan satu tautan rapi.
            </p>
            <div className={styles.heroActions}>
              <Link
                href={isLoggedIn ? createHref : '/auth/login'}
                className={styles.heroBtnPrimary}
              >
                <span>{isLoggedIn ? 'Buka Dashboard Undangan' : 'Buat Undangan Sekarang'}</span>
                <ArrowRight size={15} strokeWidth={2} />
              </Link>
              <a
                href="#templates"
                className={styles.heroBtnSecondary}
                onClick={e => handleSmoothScroll(e, 'templates')}
              >
                Lihat Koleksi Template
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>500+</span>
                <span className={styles.heroStatLabel}>Undangan Diterbitkan</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>50K+</span>
                <span className={styles.heroStatLabel}>Tamu Terhubung</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>100%</span>
                <span className={styles.heroStatLabel}>Privasi Terjamin</span>
              </div>
            </div>
          </div>

          {/* Invitation Card Mockup */}
          <div className={styles.invitationPreview}>
            <div className={styles.previewCard}>
              <div className={styles.previewBorder}>
                <p className={styles.previewLabel}>The Wedding Of</p>
                <div className={styles.previewNames}>
                  <span className={styles.previewName}>Budi</span>
                  <span className={styles.previewAnd}>&</span>
                  <span className={styles.previewName}>Ani</span>
                </div>
                <div className={styles.previewOrnament}>
                  <Sparkles size={14} strokeWidth={1.5} />
                </div>
                <p className={styles.previewDate}>Sabtu, 25 Desember 2025</p>
                <div className={styles.previewDivider} />
                <p className={styles.previewVenue}>Gedung Serbaguna Merdeka, Jakarta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Templates ──────────────────────────────────────── */}
      <section className={styles.templates} id="templates">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Koleksi Desain</p>
            <h2 className={styles.sectionTitle}>Pilih Tema Klasik Anda</h2>
            <p className={styles.sectionSubtitle}>
              Setiap template dirancang dengan proporsi simetris dan tipografi bersih untuk
              mempertegas kesakralan acara Anda.
            </p>
          </div>

          {loading ? (
            <div className={styles.templateGrid}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.templateSkeleton} />
              ))}
            </div>
          ) : (
            <div className={styles.templateGrid}>
              {templates.map(t => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  formatPrice={formatPrice}
                  isLoggedIn={isLoggedIn}
                  targetHref={
                    isLoggedIn
                      ? user?.role === 'admin'
                        ? '/admin'
                        : `/dashboard/invitations/create?template=${t.id}`
                      : '/auth/login'
                  }
                />
              ))}
            </div>
          )}

          <div className={styles.templatesCta}>
            <Link href={isLoggedIn ? createHref : '/auth/login'} className={styles.heroBtnPrimary}>
              <span>{isLoggedIn ? 'Kelola Undangan di Dashboard' : 'Mulai Buat Undangan'}</span>
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Cara Kerja ─────────────────────────────────────── */}
      <section className={styles.howItWorks} id="cara-kerja">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Kemudahan Pembuatan</p>
            <h2 className={styles.sectionTitle}>Tiga Langkah Sederhana</h2>
            <p className={styles.sectionSubtitle}>
              Mulai dari memilih konsep hingga menyebarkan tautan kepada para tamu undangan.
            </p>
          </div>

          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <span className={styles.stepNumber}>0{i + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fitur ──────────────────────────────────────────── */}
      <section className={styles.features} id="fitur">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Fitur Terintegrasi</p>
            <h2 className={styles.sectionTitle}>Kenyamanan Untuk Anda & Tamu</h2>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
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
          <h2 className={styles.ctaTitle}>Wujudkan Undangan Pernikahan yang Berkesan</h2>
          <p className={styles.ctaSubtitle}>
            Daftarkan diri Anda sekarang dan siapkan undangan berkelas tanpa kesulitan teknis.
          </p>
          <Link href={isLoggedIn ? dashboardHref : '/auth/login'} className={styles.ctaBtn}>
            <span>{isLoggedIn ? 'Buka Dashboard Anda' : 'Mulai Sekarang Tanpa Biaya'}</span>
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>INVITATION</span>
              <p className={styles.footerTagline}>
                Platform pembuatan undangan pernikahan digital bernuansa klasik, minimalis, dan
                elegan.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerLinkGroup}>
                <h4 className={styles.footerLinkTitle}>Navigasi</h4>
                <a
                  href="#templates"
                  className={styles.footerLink}
                  onClick={e => handleSmoothScroll(e, 'templates')}
                >
                  Template
                </a>
                <a
                  href="#cara-kerja"
                  className={styles.footerLink}
                  onClick={e => handleSmoothScroll(e, 'cara-kerja')}
                >
                  Cara Kerja
                </a>
                <a
                  href="#fitur"
                  className={styles.footerLink}
                  onClick={e => handleSmoothScroll(e, 'fitur')}
                >
                  Keunggulan
                </a>
              </div>
              <div className={styles.footerLinkGroup}>
                <h4 className={styles.footerLinkTitle}>Akses</h4>
                {isLoggedIn ? (
                  <Link href={dashboardHref} className={styles.footerLink}>
                    Dashboard Saya
                  </Link>
                ) : (
                  <Link href="/auth/login" className={styles.footerLink}>
                    Masuk Akun
                  </Link>
                )}
                <Link href={dashboardHref} className={styles.footerLink}>
                  Portal Undangan
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 Invitation. Dirancang dengan presisi di Indonesia.</p>
          </div>
        </div>
      </footer>

      {/* ─── Floating Scroll to Top ─────────────────────────── */}
      <button
        type="button"
        className={`${styles.scrollTopBtn} ${showScrollTop ? styles.scrollTopBtnVisible : ''}`}
        onClick={handleScrollToTop}
        title="Kembali ke atas"
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

function TemplateCard({
  template,
  formatPrice,
  isLoggedIn,
  targetHref,
}: {
  template: Template;
  formatPrice: (p: number) => string;
  isLoggedIn: boolean;
  targetHref: string;
}) {
  return (
    <div className={styles.templateCard}>
      <div className={styles.templatePreview}>
        <div className={styles.templatePreviewInner}>
          <Layers size={28} strokeWidth={1.5} className={styles.templateIcon} />
          <p className={styles.templatePreviewLabel}>Desain Seri</p>
          <p className={styles.templatePreviewTitle}>{template.name}</p>
        </div>
        {template.price === 0 && <span className={styles.templateFreeBadge}>Gratis</span>}
      </div>
      <div className={styles.templateCardBody}>
        <h3 className={styles.templateName}>{template.name}</h3>
        <div className={styles.templateMeta}>
          <span>Aktif {template.active_days_after} hari pasca acara</span>
          <span>·</span>
          <span>Batas order {template.order_deadline_days} hari sebelum</span>
        </div>
        <div className={styles.templateCardFooter}>
          <span className={styles.templatePrice}>{formatPrice(template.price)}</span>
          <Link href={targetHref} className={styles.templateBtn}>
            {isLoggedIn ? 'Gunakan Desain' : 'Pilih Desain'}
          </Link>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: <Layers size={24} strokeWidth={1.75} />,
    title: 'Pilih Koleksi Desain',
    desc: 'Tentukan gaya template klasik yang paling selaras dengan konsep acara Anda.',
  },
  {
    icon: <Edit3 size={24} strokeWidth={1.75} />,
    title: 'Lengkapi Informasi Acara',
    desc: 'Isi detail kedua mempelai, jadwal akad dan resepsi, lokasi peta, serta informasi amplop digital.',
  },
  {
    icon: <Share2 size={24} strokeWidth={1.75} />,
    title: 'Terbitkan & Bagikan',
    desc: 'Dapatkan tautan eksklusif undangan Anda dan sebarkan langsung kepada tamu terhormat.',
  },
];

const FEATURES = [
  {
    icon: <Smartphone size={22} strokeWidth={1.75} />,
    title: 'Tampilan Responsif Prima',
    desc: 'Proporsi desain presisi dan nyaman dibaca pada perangkat seluler, tablet, maupun desktop.',
  },
  {
    icon: <MessageSquare size={22} strokeWidth={1.75} />,
    title: 'Buku Tamu & Doa Restu',
    desc: 'Para tamu dapat menyampaikan konfirmasi kehadiran (RSVP) serta doa restu secara langsung.',
  },
  {
    icon: <MapPin size={22} strokeWidth={1.75} />,
    title: 'Navigasi Peta Lokasi',
    desc: 'Terhubung langsung dengan petunjuk arah Google Maps untuk memudahkan kedatangan tamu.',
  },
  {
    icon: <Globe size={22} strokeWidth={1.75} />,
    title: 'Tautan Kustom Eksklusif',
    desc: 'Setiap undangan memiliki URL khusus yang rapi dan mudah dibagikan pada media sosial.',
  },
  {
    icon: <Zap size={22} strokeWidth={1.75} />,
    title: 'Aktivasi Seketika',
    desc: 'Undangan langsung aktif dan siap diakses segera setelah proses konfirmasi selesai.',
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.75} />,
    title: 'Keamanan & Privasi Terjaga',
    desc: 'Data acara dan informasi pribadi tamu Anda tersimpan secara aman dalam sistem.',
  },
];
