// frontend/src/lib/api.ts
import { getCookie } from "cookies-next";

const DEFAULT_BASE = "http://localhost:8080";

/**
 * Base URL da API.
 * - Em produção/local, defina no .env.local: NEXT_PUBLIC_API_BASE_URL=...
 * - Se não existir, cai no DEFAULT_BASE (útil pra não quebrar dev)
 */
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/+$/, "");

function getAuthToken(): string | null {
  const raw = getCookie("token");
  const token = String(raw ?? "").replace(/^Bearer\s+/i, "").trim();
  return token ? token : null;
}

type ApiFetchOptions = RequestInit & {
  /** Se true, não envia Authorization */
  skipAuth?: boolean;
};

function joinUrl(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${base}${path}`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const token = skipAuth ? null : getAuthToken();
  if (!skipAuth && !token) {
    throw new Error("Você não está autenticado. Faça login novamente.");
  }

  const finalHeaders = new Headers(headers || {});

  // Se tiver body e não tiver Content-Type, coloca JSON por padrão
  const hasBody = rest.body !== undefined && rest.body !== null;
  if (hasBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = joinUrl(API_BASE, path);

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  });

  // tenta ler body como json (se falhar, cai pra texto)
  const data = await res.json().catch(async () => {
    const text = await res.text().catch(() => "");
    return text ? { message: text } : null;
  });

  if (!res.ok) {
    const msg =
      (data as any)?.mensagem ||
      (data as any)?.message ||
      `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
