const BASE_URL = import.meta.env.VITE_API_URL || "";

export function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  // Don't set Content-Type when sending FormData; browser will set proper multipart boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });
}
