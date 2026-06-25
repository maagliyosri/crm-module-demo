const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    // NestJS renvoie { message: string | string[] }
    const msg = Array.isArray(error.message)
      ? error.message.join(' | ')
      : error.message ?? 'Erreur serveur';
    throw new Error(msg);
  }

  return res.json();
}