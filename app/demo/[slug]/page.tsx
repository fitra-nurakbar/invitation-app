'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import type { Invitation, Message } from '@/types';
import { Sparkles, X, ArrowLeft, ShoppingBag, Smartphone, Monitor } from 'lucide-react';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { InvitationPreviewFrame } from '@/components/invitation/InvitationPreviewFrame';
import { createDemoInteractionAdapter } from '@/components/invitation/interaction-adapter';
import pubStyles from '@/app/[slug]/page.module.css';
import demoStyles from './demo.module.css';

interface TemplateInfo {
  slug: string;
  name: string;
  price: number;
  description: string;
}

const TEMPLATE_CATALOG: Record<string, TemplateInfo> = {
  'simple-free': {
    slug: 'simple-free',
    name: 'Simple Free',
    price: 0,
    description: 'Desain bersih dan esensial, cocok untuk pernikahan intim bernuansa hangat.',
  },
  'elegant-rose': {
    slug: 'elegant-rose',
    name: 'Elegant Rose',
    price: 150000,
    description: 'Nuansa mawar romantis nan anggun dengan aksen floral klasik.',
  },
  'modern-minimalist': {
    slug: 'modern-minimalist',
    name: 'Modern Minimalist',
    price: 100000,
    description: 'Tata letak modern garis tegas dengan tipografi kontemporer.',
  },
  'rustic-garden': {
    slug: 'rustic-garden',
    name: 'Rustic Garden',
    price: 200000,
    description: 'Sentuhan alam organik dengan nuansa kertas hangat dan dedaunan.',
  },
  'royal-gold': {
    slug: 'royal-gold',
    name: 'Royal Gold',
    price: 250000,
    description: 'Kemewahan klasik bernuansa emas dan monogram megah.',
  },
};

const DEMO_INVITATION: Partial<Invitation> = {
  event_date: '2026-11-20',
  detail: {
    groom: {
      name: 'Arya Pratama Wijaya, S.T.',
      place_of_birth: 'Jakarta Selatan',
      parent: 'Putra pertama dari Bpk. Prof. Dr. Bambang Wijaya & Ibu Hj. Siti Aminah',
      photo:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    bride: {
      name: 'Raden Ajeng Dian Sastrowardoyo',
      place_of_birth: 'D.I. Yogyakarta',
      parent: 'Putri kedua dari Bpk. Ir. Hendra Sastrowardoyo & Ibu Dra. Ratna Dewi',
      photo:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    quotes: {
      quote:
        'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
      attribution: 'QS. Ar-Rum: 21',
    },
    love_story: {
      title: 'Pertemuan Pertama Hingga Janji Suci',
      story:
        'Takdir mempertemukan kami dalam satu proyek desain di Jakarta Selatan. Tiga tahun saling menguatkan dan bertumbuh dalam kebaikan, kini kami memantapkan langkah menuju ikatan pernikahan yang suci dan diridhai Allah SWT.',
    },
    wedding_event: [
      {
        name: 'Akad Nikah',
        date: '2026-11-20',
        time: '08:00 - 10:00 WIB',
        place: 'Masjid Raya Al-Bina Senayan',
        address: 'Jl. Pintu Satu Senayan, Gelora, Tanah Abang, Kota Jakarta Pusat',
        maps_url: 'https://maps.google.com/?q=Masjid+Al-Bina+Senayan',
      },
      {
        name: 'Resepsi Pernikahan',
        date: '2026-11-20',
        time: '19:00 - 22:00 WIB',
        place: 'Grand Ballroom Hotel Fairmont Jakarta',
        address: 'Jl. Asia Afrika No.8, Gelora, Tanah Abang, Kota Jakarta Pusat',
        maps_url: 'https://maps.google.com/?q=Fairmont+Jakarta',
      },
    ],
    gallery: {
      photos: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      ],
    },
    streaming_platform: 'https://youtube.com/live',
    wedding_gift: [
      {
        platform: 'Bank BCA',
        id: '8830192841',
        name: 'Arya Pratama Wijaya',
      },
      {
        platform: 'Bank Mandiri',
        id: '1370019284918',
        name: 'Raden Ajeng Dian S',
      },
      {
        platform: 'QRIS',
        id: 'NMID: ID102003928194',
        name: 'Arya & Dian Wedding',
      },
    ],
    music: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-tune-680.mp3',
  },
};

export default function TemplateDemoPage() {
  const params = useParams();
  const toast = useToast();

  const rawSlug = (params?.slug as string) || 'modern-minimalist';
  const templateSlug = TEMPLATE_CATALOG[rawSlug] ? rawSlug : 'modern-minimalist';
  const currentTemplate = TEMPLATE_CATALOG[templateSlug];

  const demoBarRef = useRef<HTMLElement | null>(null);
  const [demoBarHeight, setDemoBarHeight] = useState(54);

  useEffect(() => {
    const handleResize = () => {
      if (demoBarRef.current) {
        setDemoBarHeight(demoBarRef.current.offsetHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>('responsive');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'demo-msg-1',
      invitation_id: 'demo-inv',
      name: 'Keluarga Bpk. Bambang Soediro',
      message:
        'Selamat menempuh hidup baru untuk Arya dan Dian. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
      attendance: 'hadir',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo-msg-2',
      invitation_id: 'demo-inv',
      name: 'Anisa & Dimas',
      message:
        'Barakallahu lakum wa baraka alaikum! Bahagia selalu dan senantiasa diberkahi Allah SWT.',
      attendance: 'hadir',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'demo-msg-3',
      invitation_id: 'demo-inv',
      name: 'Rudi Hartono (Alumni FTUI 2015)',
      message:
        'Selamat sobatku Arya! Mohon maaf belum bisa hadir langsung karena dinas luar kota, titip doa terbaik untuk kalian berdua.',
      attendance: 'tidak_hadir',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);

  const getThemeClass = (tplSlug: string) => {
    switch (tplSlug) {
      case 'elegant-rose':
        return pubStyles.theme_elegant_rose;
      case 'modern-minimalist':
        return pubStyles.theme_modern_minimalist;
      case 'rustic-garden':
        return pubStyles.theme_rustic_garden;
      case 'royal-gold':
        return pubStyles.theme_royal_gold;
      default:
        return '';
    }
  };

  const themeClass = getThemeClass(templateSlug);
  const interaction = createDemoInteractionAdapter({
    onOpenInvitation: () => setIsOpen(true),
    onOpenGallery: photo => setLightboxPhoto(photo),
    onSubmitRsvp: payload => {
      setSubmittingRsvp(true);
      setTimeout(() => {
        const newMsg: Message = {
          id: `demo-msg-${Date.now()}`,
          invitation_id: 'demo-inv',
          name: payload.name,
          message: payload.message,
          attendance: payload.attendance,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [newMsg, ...prev]);
        setSubmittingRsvp(false);
        toast.info(
          'Simulasi RSVP berhasil dicatat! Pada undangan asli, ucapan ini akan langsung tersimpan di database.',
          'Pratinjau Interaktif'
        );
      }, 300);
    },
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const renderInvitationContent = () => (
    <div
      className={`${pubStyles.wrapper} ${themeClass} ${
        deviceMode === 'mobile'
          ? `${demoStyles.mobileWrapper} ${!isOpen ? demoStyles.mobileWrapperCoverClosed : ''}`
          : ''
      }`}
    >
      <InvitationRenderer
        invitation={DEMO_INVITATION}
        mode="demo"
        className={pubStyles.mainContainer}
        themeClassName={themeClass}
        coverModalClassName={
          deviceMode === 'mobile' ? demoStyles.demoCoverModalMobile : demoStyles.demoCoverModal
        }
        interaction={interaction}
        isOpen={isOpen}
        guestName="Tamu Undangan Terhormat"
        messages={messages}
        rsvpSubmitting={submittingRsvp}
      />
      {lightboxPhoto && (
        <div className={pubStyles.lightbox} onClick={() => setLightboxPhoto(null)}>
          <button
            className={pubStyles.lightboxClose}
            onClick={() => setLightboxPhoto(null)}
            type="button"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Perbesar Foto"
            className={pubStyles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={{ '--demo-bar-height': `${demoBarHeight}px` } as React.CSSProperties}>
      <header ref={demoBarRef} className={demoStyles.demoBar}>
        <div className={demoStyles.demoInfo}>
          <div className={demoStyles.demoBadge}>
            <Sparkles size={12} strokeWidth={2} />
            <span>Mode Demo</span>
          </div>
          <div>
            <span className={demoStyles.demoTemplateName}>{currentTemplate.name}</span>
            <span className={demoStyles.demoLabel}> ({formatPrice(currentTemplate.price)})</span>
          </div>
        </div>
        <div className={demoStyles.switcher}>
          {Object.values(TEMPLATE_CATALOG).map(t => (
            <Link
              key={t.slug}
              href={`/demo/${t.slug}`}
              className={`${demoStyles.switcherBtn} ${
                templateSlug === t.slug ? demoStyles.switcherBtnActive : ''
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>
        <div className={demoStyles.deviceToggle}>
          <button
            type="button"
            className={`${demoStyles.deviceToggleBtn} ${
              deviceMode === 'responsive' ? demoStyles.deviceToggleBtnActive : ''
            }`}
            onClick={() => setDeviceMode('responsive')}
            title="Tampilan Penuh Layar"
          >
            <Monitor size={13} strokeWidth={1.75} />
            <span>Layar Penuh</span>
          </button>
          <button
            type="button"
            className={`${demoStyles.deviceToggleBtn} ${
              deviceMode === 'mobile' ? demoStyles.deviceToggleBtnActive : ''
            }`}
            onClick={() => setDeviceMode('mobile')}
            title="Simulasi Tampilan Ponsel (430px)"
          >
            <Smartphone size={13} strokeWidth={1.75} />
            <span>Ponsel</span>
          </button>
        </div>
        <div className={demoStyles.demoActions}>
          <Link href="/dashboard/templates" className={demoStyles.actionBtnBack}>
            <ArrowLeft size={13} strokeWidth={1.75} />
            <span>Katalog Template</span>
          </Link>
          <Link href="/dashboard/templates" className={demoStyles.actionBtnSelect}>
            <ShoppingBag size={13} strokeWidth={1.75} />
            <span>Pesan Template Ini</span>
          </Link>
        </div>
      </header>
      {deviceMode === 'mobile' ? (
        <div className={demoStyles.mobileBackdrop}>
          <InvitationPreviewFrame
            isCoverOpen={isOpen}
            onResetCover={() => setIsOpen(false)}
            className={demoStyles.demoPhoneMockup}
          >
            {renderInvitationContent()}
          </InvitationPreviewFrame>
        </div>
      ) : (
        renderInvitationContent()
      )}
    </div>
  );
}
