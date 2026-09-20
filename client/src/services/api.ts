const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) return '/api';
  const cleaned = envUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${cleaned}/api`;
};

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('rankly-auth') 
    ? JSON.parse(localStorage.getItem('rankly-auth') as string)?.state?.token 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const apiBase = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${apiBase}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');

  if (response.status === 401) {
    const data = await response.json().catch(() => null);
    const errorMessage = data?.error?.message || data?.message || 'Invalid email or password.';

    if (!isAuthEndpoint) {
      localStorage.removeItem('rankly-auth');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || 'Something went wrong';
    throw new Error(errorMessage);
  }

  return data;
};

