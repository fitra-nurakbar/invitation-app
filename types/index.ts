export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export type BlockType =
  | 'cover'
  | 'couple'
  | 'quote'
  | 'event'
  | 'love_story'
  | 'gallery'
  | 'gift'
  | 'streaming'
  | 'rsvp'
  | 'footer';

export interface ThemeConfig {
  version: number;
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent?: string;
  };
  layout: {
    content_width: number;
    section_spacing: number;
    border_radius: number;
  };
  background: {
    type: 'color' | 'image';
    color: string;
    image_url?: string;
    overlay_color?: string;
    overlay_opacity?: number;
  };
}

export interface BlockConfig {
  allowed_blocks: BlockType[];
  default_order: BlockType[];
  locked_blocks: BlockType[];
  defaults?: Record<string, Record<string, unknown>>;
}

export interface InvitationSection {
  id: string;
  type: BlockType;
  visible: boolean;
  settings?: Record<string, unknown>;
}

export interface InvitationLayout {
  version: number;
  sections: InvitationSection[];
  overrides?: Partial<ThemeConfig>;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  preview_url?: string;
  category?: string;
  price: number;
  is_premium?: boolean;
  is_active: boolean;
  order_deadline_days: number;
  active_days_after: number;
  theme_config?: ThemeConfig;
  block_config?: BlockConfig;
  version?: number;
}

export interface PersonDetail {
  name: string;
  place_of_birth?: string;
  birth_date?: string;
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
  layout?: InvitationLayout;
  layout_version?: number;
  draft_layout?: InvitationLayout;
  published_layout?: InvitationLayout;
  published_at?: string;
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
