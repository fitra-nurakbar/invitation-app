import {
  User,
  Template,
  Invitation,
  InvitationDetail,
  Order,
  UserTemplate,
  Message,
  ApiResponse,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error && err.message ? err.message : 'Gagal terhubung ke server backend';
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  let data: Record<string, unknown> | null = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const rawError = data?.error || data?.message;
    const errorMsg =
      typeof rawError === 'string'
        ? rawError
        : res.status === 404
          ? 'Endpoint API tidak ditemukan (404). Silakan restart backend dengan perubahan terbaru.'
          : `Request gagal dengan status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // ─── Auth ────────────────────────────────────────────────
  sendOTP: (email: string, name?: string) =>
    request<{ message: string; expires_in?: string; cooldown_s?: number; otp_code?: string }>(
      '/auth/otp/send',
      {
        method: 'POST',
        body: { email, name },
      }
    ),

  verifyOTP: (email: string, otp: string) =>
    request<{ message: string; token: string; user: User }>('/auth/otp/verify', {
      method: 'POST',
      body: { email, otp },
    }),

  getMe: (token: string) => request<ApiResponse<User>>('/auth/me', { token }),

  updateProfile: (token: string, body: { name?: string; avatar?: string }) =>
    request<{ message: string; data: User }>('/auth/me', {
      method: 'PUT',
      body,
      token,
    }),

  // ─── Invitations (User) ──────────────────────────────────
  getInvitations: (token: string) =>
    request<ApiResponse<Invitation[]>>('/invitations/me', { token }),

  getInvitationById: (token: string, id: string) =>
    request<ApiResponse<Invitation>>(`/invitations/me/${id}`, { token }),

  createInvitation: (
    token: string,
    body: {
      template_id: string;
      slug: string;
      event_date: string;
      detail: InvitationDetail;
    }
  ) => request<ApiResponse<Invitation>>('/invitations', { method: 'POST', body, token }),

  updateInvitation: (
    token: string,
    id: string,
    body: {
      slug?: string;
      event_date?: string;
      status?: string;
      detail?: InvitationDetail;
    }
  ) => request<ApiResponse<Invitation>>(`/invitations/me/${id}`, { method: 'PUT', body, token }),

  deleteInvitation: (token: string, id: string) =>
    request<{ message: string }>(`/invitations/me/${id}`, { method: 'DELETE', token }),

  getMyInvitationMessages: (token: string, id: string) =>
    request<ApiResponse<Message[]>>(`/invitations/me/${id}/messages`, { token }),

  deleteMyInvitationMessage: (token: string, invitationId: string, messageId: string) =>
    request<{ message: string }>(`/invitations/me/${invitationId}/messages/${messageId}`, {
      method: 'DELETE',
      token,
    }),

  // ─── Public Invitation & Messages ────────────────────────
  getInvitationBySlug: (slug: string) => request<ApiResponse<Invitation>>(`/invitations/${slug}`),

  getMessages: (slug: string) => request<ApiResponse<Message[]>>(`/invitations/${slug}/messages`),

  postMessage: (slug: string, body: { name: string; message: string; attendance?: string }) =>
    request<ApiResponse<Message>>(`/invitations/${slug}/messages`, { method: 'POST', body }),

  // ─── Templates ───────────────────────────────────────────
  getTemplates: (token?: string) =>
    request<ApiResponse<Template[]>>('/templates/public', { token }),

  getMyTemplates: (token: string) =>
    request<ApiResponse<UserTemplate[]>>('/templates/me', { token }),

  // ─── Orders ──────────────────────────────────────────────
  getOrders: (token: string) => request<ApiResponse<Order[]>>('/orders', { token }),

  createOrder: (token: string, templateId: string) =>
    request<{ message: string; data: Order; invoice_url: string }>('/orders', {
      method: 'POST',
      body: { template_id: templateId },
      token,
    }),

  cancelOrder: (token: string, id: string) =>
    request<{ message: string }>(`/orders/${id}/cancel`, { method: 'POST', token }),

  // ─── Admin Endpoints ─────────────────────────────────────
  adminLogin: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/admin/auth/login', {
      method: 'POST',
      body,
    }),

  getAdminUsers: (token: string) => request<ApiResponse<User[]>>('/admin/users', { token }),

  deleteAdminUser: (token: string, id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', token }),

  getAdminTemplates: (token: string) =>
    request<ApiResponse<Template[]>>('/admin/templates', { token }),

  createAdminTemplate: (token: string, body: Partial<Template>) =>
    request<ApiResponse<Template>>('/admin/templates', { method: 'POST', body, token }),

  updateAdminTemplate: (token: string, id: string, body: Partial<Template>) =>
    request<ApiResponse<Template>>(`/admin/templates/${id}`, { method: 'PUT', body, token }),

  deleteAdminTemplate: (token: string, id: string) =>
    request<{ message: string }>(`/admin/templates/${id}`, { method: 'DELETE', token }),

  getAdminOrders: (token: string) => request<ApiResponse<Order[]>>('/admin/orders', { token }),

  getAdminInvitations: (token: string) =>
    request<ApiResponse<Invitation[]>>('/admin/invitations', { token }),

  deleteAdminInvitation: (token: string, id: string) =>
    request<{ message: string }>(`/admin/invitations/${id}`, { method: 'DELETE', token }),

  getAdminMessages: (token: string) =>
    request<ApiResponse<Message[]>>('/admin/messages', { token }),

  deleteAdminMessage: (token: string, id: string) =>
    request<{ message: string }>(`/admin/messages/${id}`, { method: 'DELETE', token }),

  changeAdminPassword: (token: string, body: { old_password: string; new_password: string }) =>
    request<{ message: string }>('/admin/auth/change/password', {
      method: 'POST',
      body,
      token,
    }),

  createAdmin: (token: string, body: { name: string; email: string; password: string }) =>
    request<{ message: string; data: User }>('/admin/auth/create', {
      method: 'POST',
      body,
      token,
    }),

  // ─── Upload Media ─────────────────────────────────────────
  uploadFile: async (
    token: string,
    file: File
  ): Promise<{
    message: string;
    data: { url: string; path: string; filename: string; size: number; content_type: string };
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const contentType = res.headers.get('content-type') || '';
    let data: Record<string, unknown> | null = null;
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const rawError = data?.error || data?.message;
      const errorMsg =
        typeof rawError === 'string' ? rawError : `HTTP ${res.status}: Gagal mengunggah file`;
      throw new Error(errorMsg);
    }

    return data as unknown as {
      message: string;
      data: { url: string; path: string; filename: string; size: number; content_type: string };
    };
  },
};
