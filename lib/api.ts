import type { User, Template, Invitation, Order, UserTemplate, ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan')
  return data
}

export const api = {
  // ─── Auth ───────────────────────────────────────────────
  requestMagicLink: (email: string, name?: string) =>
    request<{ message: string; magic_url?: string }>('/auth/magic-link', {
      method: 'POST', body: { email, name },
    }),

  verifyMagicLink: (token: string) =>
    request<{ message: string; token: string; user: User }>(`/auth/verify-api?token=${token}`),

  getMe: (token: string) =>
    request<ApiResponse<User>>('/auth/me', { token }),

  // ─── Invitations ────────────────────────────────────────
  getInvitations: (token: string) =>
    request<ApiResponse<Invitation[]>>('/admin/invitations', { token }),

  getInvitationBySlug: (slug: string) =>
    request<ApiResponse<Invitation>>(`/invitations/${slug}`),

  createInvitation: (token: string, body: Partial<Invitation>) =>
    request<ApiResponse<Invitation>>('/invitations', { method: 'POST', body, token }),

  updateInvitation: (token: string, id: string, body: Partial<Invitation>) =>
    request<ApiResponse<Invitation>>(`/invitations/${id}`, { method: 'PUT', body, token }),

  deleteInvitation: (token: string, id: string) =>
    request<{ message: string }>(`/invitations/${id}`, { method: 'DELETE', token }),

  // ─── Templates ──────────────────────────────────────────
  getTemplates: (token: string) =>
    request<ApiResponse<Template[]>>('/templates/public', { token }),

  // ─── Orders ─────────────────────────────────────────────
  getOrders: (token: string) =>
    request<ApiResponse<Order[]>>('/orders', { token }),

  createOrder: (token: string, templateId: string) =>
    request<{ message: string; data: Order; invoice_url: string }>('/orders', {
      method: 'POST', body: { template_id: templateId }, token,
    }),

  cancelOrder: (token: string, id: string) =>
    request<{ message: string }>(`/orders/${id}/cancel`, { method: 'POST', token }),

  // ─── My Templates ───────────────────────────────────────
  getMyTemplates: (token: string) =>
    request<ApiResponse<UserTemplate[]>>('/my-templates', { token }),
}