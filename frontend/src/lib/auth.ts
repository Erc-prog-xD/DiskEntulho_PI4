'use client';

import { getCookie, deleteCookie, setCookie } from "cookies-next";

const TOKEN_COOKIE = "token";

export function getAuthToken(): string {
  const raw = getCookie(TOKEN_COOKIE);
  // alguns lugares do projeto removem "Bearer " manualmente :contentReference[oaicite:6]{index=6}
  return String(raw ?? "").replace(/^Bearer\s+/i, "").trim();
}

export function setAuthToken(token: string, expSeconds?: number) {
  // define duração do cookie: se token tiver exp, usa ela; senão 1 dia
  const now = Math.floor(Date.now() / 1000);
  const maxAge = expSeconds && expSeconds > now ? expSeconds - now : 60 * 60 * 24;

  // cookie acessível no client (porque o middleware lê cookie, mas é no server)
  // Ideal seria HttpOnly setado pelo backend, mas hoje seu login seta no client :contentReference[oaicite:7]{index=7}
  setCookie(TOKEN_COOKIE, token, {
    path: "/",
    sameSite: "lax",
    maxAge,
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  });
}

export function logout(redirectTo: string = "/auth/login") {
  // limpa cookie e storage (você salva em ambos hoje) :contentReference[oaicite:8]{index=8}
  deleteCookie(TOKEN_COOKIE, { path: "/" });
  try { localStorage.removeItem("token"); } catch {}

  window.location.href = redirectTo;
}
