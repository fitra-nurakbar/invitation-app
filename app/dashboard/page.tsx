'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Invitation, Order, UserTemplate } from '@/types'
import styles from './page.module.css'

export default function DashboardPage() {
  const { user, token } = useAuth()

  const [invitations, setInvitations]   = useState<Invitation[]>([])
  const [orders, setOrders]             = useState<Order[]>([])
  const [myTemplates, setMyTemplates]   = useState<UserTemplate[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchAll = async () => {
      try {
        const [invRes, ordRes, tmplRes] = await Promise.all([
          api.getInvitations(token),
          api.getOrders(token),
          api.getMyTemplates(token),
        ])
        setInvitations(invRes.data || [])
        setOrders(ordRes.data || [])
        setMyTemplates(tmplRes.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [token])

  const activeInvitations = invitations.filter(i => i.status === 'active').length
  const pendingOrders     = orders.filter(o => o.status === 'pending').length
  const recentInvitation  = invitations[0]

  if (loading) return <LoadingState />

  return (
    <div>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          Halo, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className={styles.greetingSubtitle}>
          Kelola undangan digital kamu dari sini
        </p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard
          icon="💌"
          label="Total Undangan"
          value={invitations.length}
          sub={`${activeInvitations} aktif`}
          color="purple"
        />
        <StatCard
          icon="🎨"
          label="Template Dimiliki"
          value={myTemplates.length}
          sub="template aktif"
          color="blue"
        />
        <StatCard
          icon="🧾"
          label="Total Order"
          value={orders.length}
          sub={pendingOrders > 0 ? `${pendingOrders} menunggu bayar` : 'semua selesai'}
          color={pendingOrders > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Aksi Cepat</h2>
        <div className={styles.actions}>
          <Link href="/dashboard/invitations/create" className={styles.actionCard}>
            <span className={styles.actionIcon}>✏️</span>
            <span className={styles.actionLabel}>Buat Undangan Baru</span>
          </Link>
          <Link href="/dashboard/templates" className={styles.actionCard}>
            <span className={styles.actionIcon}>🛒</span>
            <span className={styles.actionLabel}>Browse Template</span>
          </Link>
          <Link href="/dashboard/orders" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Lihat Riwayat Order</span>
          </Link>
        </div>
      </div>

      {/* Recent Invitation */}
      {recentInvitation && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Undangan Terbaru</h2>
          <div className={styles.recentCard}>
            <div className={styles.recentInfo}>
              <div className={styles.recentNames}>
                {recentInvitation.detail?.groom} & {recentInvitation.detail?.bride}
              </div>
              <div className={styles.recentMeta}>
                <span>📅 {new Date(recentInvitation.event_date).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}</span>
                <span>🔗 /{recentInvitation.slug}</span>
              </div>
            </div>
            <div className={styles.recentActions}>
              <StatusBadge status={recentInvitation.status} />
              <Link
                href={`/dashboard/invitations/${recentInvitation.id}`}
                className={styles.recentBtn}
              >
                Kelola →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <div className={styles.alert}>
          <span>⚠️</span>
          <div>
            <strong>Kamu punya {pendingOrders} order yang menunggu pembayaran</strong>
            <p>Selesaikan pembayaran sebelum invoice expired.</p>
          </div>
          <Link href="/dashboard/orders" className={styles.alertBtn}>
            Bayar Sekarang
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Sub Components ───────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: string
  label: string
  value: number
  sub: string
  color: 'purple' | 'blue' | 'green' | 'yellow'
}) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:  { label: 'Aktif',   cls: 'green'  },
    draft:   { label: 'Draft',   cls: 'gray'   },
    expired: { label: 'Expired', cls: 'red'    },
  }
  const s = map[status] || { label: status, cls: 'gray' }
  return <span className={`${styles.badge} ${styles[`badge_${s.cls}`]}`}>{s.label}</span>
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  )
}