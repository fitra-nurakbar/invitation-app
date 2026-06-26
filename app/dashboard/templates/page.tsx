'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Template, UserTemplate } from '@/types'
import styles from './page.module.css'

export default function TemplatesPage() {
  const { token } = useAuth()
  const [templates, setTemplates]     = useState<Template[]>([])
  const [myTemplates, setMyTemplates] = useState<UserTemplate[]>([])
  const [loading, setLoading]         = useState(true)
  const [buying, setBuying]           = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.getTemplates(token),
      api.getMyTemplates(token),
    ]).then(([tmplRes, myRes]) => {
      setTemplates(tmplRes.data || [])
      setMyTemplates(myRes.data || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const ownedIds = new Set(myTemplates.map(t => t.template_id))

  const handleBuy = async (templateId: string) => {
    if (!token) return
    setBuying(templateId)
    try {
      const res = await api.createOrder(token, templateId)
      window.location.href = res.invoice_url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat order')
      setBuying(null)
    }
  }

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Template Undangan</h1>
        <p className={styles.subtitle}>
          Kamu memiliki {myTemplates.length} template
        </p>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <div className={styles.grid}>
          {templates.map(tmpl => {
            const owned    = ownedIds.has(tmpl.id)
            const isBuying = buying === tmpl.id

            return (
              <div key={tmpl.id} className={`${styles.card} ${owned ? styles.cardOwned : ''}`}>
                {/* Preview placeholder */}
                <div className={styles.preview}>
                  <span className={styles.previewIcon}>💌</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardName}>{tmpl.name}</h3>
                    {owned && <span className={styles.ownedBadge}>✓ Dimiliki</span>}
                  </div>

                  <div className={styles.cardInfo}>
                    <span>📅 Aktif {tmpl.active_days_after} hari setelah acara</span>
                    <span>⏰ Order max {tmpl.order_deadline_days} hari sebelum</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatPrice(tmpl.price)}</span>

                    {owned ? (
                      <button className={styles.ownedBtn} disabled>
                        Sudah Dimiliki
                      </button>
                    ) : (
                      <button
                        className={styles.buyBtn}
                        onClick={() => handleBuy(tmpl.id)}
                        disabled={isBuying}
                      >
                        {isBuying ? 'Memproses...' : tmpl.price === 0 ? 'Ambil Gratis' : 'Beli Sekarang'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}