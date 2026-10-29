export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_active: boolean;
  order_deadline_days: number;
  active_days_after: number;
}

export interface PersonDetail {
  name: string;
  place_of_birth?: string;
  parent?: string;
  photo?: string;
}

export interface WeddingEvent {
  name: string;
  date: string;
  time: string;
  place: string;
  address?: string;
  maps_url?: string;
}

export interface WeddingGift {
  platform: string;
  name: string;
  id: string;
  qris_image?: string;
}

export interface InvitationDetail {
  cover_image?: string;
  bride?: string | PersonDetail;
  groom?: string | PersonDetail;
  venue?: string;
  venue_maps_url?: string;
  akad?: { time: string; place: string };
  resepsi?: { time: string; place: string };
  bride_parents?: string;
  groom_parents?: string;
  music?: string;
  quotes?: {
    quote?: string;
    attribution?: string;
  };
  wedding_event?: WeddingEvent[];
  wedding_gift?: WeddingGift[];
  streaming_platform?: string;
  gallery?: {
    photos?: string[];
    [key: string]: unknown;
  };
  love_story?: {
    title?: string;
    story?: string;
    [key: string]: unknown;
  };
}

export interface Invitation {
  id: string;
  user_id: string;
  template_id: string;
  slug: string;
  event_date: string;
  status: 'draft' | 'active' | 'expired';
  expires_at: string;
  detail: InvitationDetail;
  template?: Template;
  user?: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  invitation_id: string;
  name: string;
  message: string;
  attendance?: string;
  created_at: string;
}

export interface Order {
  id: string;
  template_id: string;
  invoice_id: string;
  invoice_url: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  expires_at: string;
  paid_at?: string;
  payment_method?: string;
  payment_channel?: string;
  created_at: string;
  template?: Template;
}

export interface UserTemplate {
  id: string;
  template_id: string;
  order_id: string;
  granted_at: string;
  template?: Template;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
