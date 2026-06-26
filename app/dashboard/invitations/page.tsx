'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Invitation } from '@/types'
import styles from './page.module.css'

export default function InvitationsPage() {
    const { token } = useAuth()
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        api.getInvitations(token)
            .then(res => setInvitations(res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [token])

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Hapus undangan ini?')) return
        setDeleting(id)
        try {
            await api.deleteInvitation(token, id)
            setInvitations(prev => prev.filter(i => i.id !== id))
        } catch (err) {
            alert('Gagal menghapus undangan')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Undangan Saya</h1>
                    <p className={styles.subtitle}>{invitations.length} undangan total</p>
                </div>
                <Link href="/dashboard/invitations/create" className={styles.createBtn}>
                    + Buat Undangan
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loadingList}>
                    {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : invitations.length === 0 ? (
                <EmptyState />
            ) : (
                <div className={styles.list}>
                    {invitations.map(inv => (
                        <div key={inv.id} className={styles.card}>
                            <div className={styles.cardLeft}>
                                <div className={styles.cardNames}>
                                    {inv.detail?.groom || '—'} & {inv.detail?.bride || '—'}
                                </div>
                                <div className={styles.cardMeta}>
                                    <span>📅 {new Date(inv.event_date).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}</span>
                                    <span>🔗 /{inv.slug}</span>
                                    {inv.detail?.venue && <span>📍 {inv.detail.venue}</span>}
                                </div>
                            </div>

                            <div className={styles.cardRight}>
                                <StatusBadge status={inv.status} />
                                <div className={styles.cardActions}>
                                    <Link
                                        href={`/dashboard/invitations/${inv.id}`}
                                        className={styles.editBtn}
                                    >
                                        Edit
                                    </Link>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_INVITATION_URL}/${inv.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={styles.previewBtn}
                                    >
                                        Preview
                                    </a>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(inv.id)}
                                        disabled={deleting === inv.id}
                                    >
                                        {deleting === inv.id ? '...' : 'Hapus'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        active: { label: 'Aktif', cls: 'green' },
        draft: { label: 'Draft', cls: 'gray' },
        expired: { label: 'Expired', cls: 'red' },
    }
    const s = map[status] || { label: status, cls: 'gray' }
    return <span className={`${styles.badge} ${styles[`badge_${s.cls}`]}`}>{s.label}</span>
}

function EmptyState() {
    return (
        <div className={styles.empty}>
            <div className={styles.emptyIcon}>💌</div>
            <h3 className={styles.emptyTitle}>Belum ada undangan</h3>
            <p className={styles.emptyText}>Buat undangan digital pertamamu sekarang!</p>
            <Link href="/dashboard/invitations/create" className={styles.emptyBtn}>
                Buat Undangan Pertama
            </Link>
        </div>
    )
}