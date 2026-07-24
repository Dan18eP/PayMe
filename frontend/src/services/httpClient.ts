const BASE_URL = "/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

class HttpClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("auth_refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("auth_refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config?: RequestConfig
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (config?.params) {
    Object.entries(config.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  let response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !path.includes("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = localStorage.getItem("auth_token");
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
      throw new HttpClientError(401, "Sesión expirada");
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Error del servidor",
    }));
    throw new HttpClientError(response.status, error.error, error.details);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export const httpClient = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>("GET", path, undefined, config),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("POST", path, body, config),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PATCH", path, body, config),
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>("DELETE", path, undefined, config),
};

export { HttpClientError };
