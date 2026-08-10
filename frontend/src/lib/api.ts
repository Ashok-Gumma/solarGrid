const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; details?: any; pagination?: any }> {
  const token = localStorage.getItem('solargrid_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const body = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: body.message || `HTTP Error ${res.status}`,
        details: body.details,
      };
    }

    return body;
  } catch (error: any) {
    console.error(`[API_ERROR] ${endpoint}:`, error);
    return {
      success: false,
      message: error.message || 'Network error connecting to backend API.',
    };
  }
}
