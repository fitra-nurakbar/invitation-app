export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  created_at: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface MagicLinkResponse {
  message: string
  magic_url?: string  // hanya di development
  expires_in?: string
}