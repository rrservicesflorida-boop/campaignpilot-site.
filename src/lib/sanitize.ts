/**
 * Nunca renderizamos HTML fornecido pelo usuário. Estas funções normalizam e
 * neutralizam entradas antes de exibir ou persistir.
 */
export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
}

export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return stripHtml(value).slice(0, maxLength);
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Rate limit simples no cliente (defesa em profundidade, não substitui o servidor). */
export function throttleKey(key: string, maxAttempts: number, windowMs: number): boolean {
  if (typeof window === "undefined") return true;
  const storageKey = `cp.rl.${key}`;
  const now = Date.now();
  let hits: number[] = [];
  try {
    hits = (JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as number[]).filter(
      (t) => now - t < windowMs,
    );
  } catch {
    hits = [];
  }
  if (hits.length >= maxAttempts) return false;
  hits.push(now);
  window.localStorage.setItem(storageKey, JSON.stringify(hits));
  return true;
}