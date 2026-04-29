import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authStorage";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function loginWithGoogleCredential(credential: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed (${res.status}): ${err}`);
  }

  const body = (await res.json()) as AuthResponse;
  setAuthToken(body.token);
  return body.user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Session expired");
  }

  const body = (await res.json()) as { user: AuthUser };
  return body.user;
}

export function logout() {
  clearAuthToken();
}
