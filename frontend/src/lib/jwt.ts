import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  role: "Admin" | "Client";
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}
