export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SendOTPResponse {
  message: string;
  expires_in?: string;
  cooldown_s?: number;
  otp_code?: string; // hanya di development
}
