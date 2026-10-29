'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import type { Template, UserTemplate } from '@/types';
import { Check, Calendar, Clock, Layers, Eye } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function TemplatesPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [myTemplates, setMyTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getTemplates(token), api.getMyTemplates(token)])
      .then(([tmplRes, myRes]) => {
        setTemplates(tmplRes.data || []);
        setMyTemplates(myRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const ownedIds = new Set(myTemplates.map(t => t.template_id));

  const handleBuy = async (templateId: string) => {
    if (!token) return;
    setBuying(templateId);
    try {
      const res = await api.createOrder(token, templateId);
      if (res.invoice_url) {
        toast.info('Mengalihkan ke gateway pembayaran...', 'Menyiapkan Transaksi');
        window.location.href = res.invoice_url;
      } else {
        toast.success(res.message || 'Template berhasil diaktifkan!', 'Berhasil Aktif');
        const myRes = await api.getMyTemplates(token);
        setMyTemplates(myRes.data || []);
        setBuying(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat order', 'Gagal');
      setBuying(null);
    }
  };

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Koleksi Desain Template</h1>
        <p className={styles.subtitle}>
          Pilih template berdesain klasik dan elegan untuk undangan pernikahan Anda (
          {myTemplates.length} dimiliki)
        </p>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {templates.map(tmpl => {
            const owned = ownedIds.has(tmpl.id);
            const isBuying = buying === tmpl.id;

            return (
              <div key={tmpl.id} className={`${styles.card} ${owned ? styles.cardOwned : ''}`}>
                {/* Preview graphic */}
                <div className={styles.preview}>
                  <div className={styles.previewFrame}>
                    <Layers size={28} strokeWidth={1.5} className={styles.previewIcon} />
                    <span className={styles.previewTag}>{tmpl.name}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardName}>{tmpl.name}</h3>
                    {owned && (
                      <span className={styles.ownedBadge}>
                        <Check size={12} strokeWidth={2} />
                        <span>Dimiliki</span>
                      </span>
                    )}
                  </div>

                  <div className={styles.cardInfo}>
                    <span>
                      <Calendar size={13} strokeWidth={1.75} />
                      Aktif {tmpl.active_days_after} hari pasca acara
                    </span>
                    <span>
                      <Clock size={13} strokeWidth={1.75} />
                      Order maks {tmpl.order_deadline_days} hari sebelum
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatPrice(tmpl.price)}</span>

                    <div className={styles.btnGroup}>
                      <Link
                        href={`/demo/${tmpl.slug || 'elegant-rose'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.demoBtn}
                        title="Lihat Pratinjau Desain"
                      >
                        <Eye size={13} strokeWidth={1.75} />
                        <span>Demo</span>
                      </Link>

                      {owned ? (
                        <button className={styles.ownedBtn} disabled>
                          Dimiliki
                        </button>
                      ) : (
                        <button
                          className={styles.buyBtn}
                          onClick={() => handleBuy(tmpl.id)}
                          disabled={isBuying}
                        >
                          {isBuying
                            ? 'Memproses...'
                            : tmpl.price === 0
                              ? 'Gunakan Gratis'
                              : 'Pesan'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
