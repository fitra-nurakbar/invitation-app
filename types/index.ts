export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  created_at: string
}

export interface Template {
  id: string
  name: string
  price: number
  is_active: boolean
  order_deadline_days: number
  active_days_after: number
}

export interface Invitation {
  id: string
  user_id: string
  template_id: string
  slug: string
  event_date: string
  status: 'draft' | 'active' | 'expired'
  expires_at: string
  detail: InvitationDetail
  template?: Template
}

export interface InvitationDetail {
  bride?: string
  groom?: string
  venue?: string
  venue_maps_url?: string
  akad?: { time: string; place: string }
  resepsi?: { time: string; place: string }
  bride_parents?: string
  groom_parents?: string
  music?: string
}

export interface Order {
  id: string
  template_id: string
  invoice_id: string
  invoice_url: string
  amount: number
  status: 'pending' | 'paid' | 'expired' | 'failed'
  expires_at: string
  paid_at?: string
  payment_method?: string
  payment_channel?: string
  created_at: string
  template?: Template
}

export interface UserTemplate {
  id: string
  template_id: string
  order_id: string
  granted_at: string
  template?: Template
}

export interface ApiResponse<T> {
  data: T
  message?: string
}