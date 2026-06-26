'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Order } from '@/types'
import styles from './page.module.css'

export default function OrdersPage() {
    const { token } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        api.getOrders(token)
            .then(res => setOrders(res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [token])

    const handleCancel = async (id: string) => {
        if (!token || !confirm('Batalkan order ini?')) return
        setCancelling(id)
        try {
            await api.cancelOrder(token, id)
            setOrders(prev => prev.map(o =>
                o.id === id ? { ...o, status: 'expired' } : o
            ))
        } catch {
            alert('Gagal membatalkan order')
        } finally {
            setCancelling(null)
        }
    }

    const formatPrice = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
    const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    const statusMap: Record<string, { label: string; cls: string }> = {
        pending: { label: 'Menunggu Bayar', cls: 'yellow' },
        paid: { label: 'Lunas', cls: 'green' },
        expired: { label: 'Expired', cls: 'gray' },
        failed: { label: 'Gagal', cls: 'red' },
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Riwayat Order</h1>
                <p className={styles.subtitle}>{orders.length} order total</p>
            </div>

            {loading ? (
                <div className={styles.list}>
                    {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : orders.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>🧾</div>
                    <h3>Belum ada order</h3>
                    <p>Beli template untuk mulai membuat undangan</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {orders.map(order => {
                        const s = statusMap[order.status] || { label: order.status, cls: 'gray' }
                        return (
                            <div key={order.id} className={styles.card}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.templateName}>
                                        🎨 {order.template?.name || 'Template'}
                                    </div>
                                    <div className={styles.meta}>
                                        <span>📅 {formatDate(order.created_at)}</span>
                                        {order.payment_method && (
                                            <span>💳 {order.payment_method} — {order.payment_channel}</span>
                                        )}
                                        {order.paid_at && (
                                            <span>✅ Dibayar: {formatDate(order.paid_at)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.cardRight}>
                                    <div className={styles.amount}>{formatPrice(order.amount)}</div>
                                    <span className={`${styles.badge} ${styles[`badge_${s.cls}`]}`}>
                                        {s.label}
                                    </span>
                                    <div className={styles.actions}>
                                        {order.status === 'pending' && (
                                            <>
                                                <a
                                                    href={order.invoice_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={styles.payBtn}
                                                >
                                                    Bayar
                                                </a>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={() => handleCancel(order.id)}
                                                    disabled={cancelling === order.id}
                                                >
                                                    {cancelling === order.id ? '...' : 'Batal'}
                                                </button>
                                            </>
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