const AUTH_TOKEN_STORAGE = "gst_auth_token";

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_STORAGE) || "";
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_STORAGE, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE);
}
