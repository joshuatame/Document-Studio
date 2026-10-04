const ACCESS_TOKEN_KEY = "document-studio-access-token";
const REFRESH_TOKEN_KEY = "document-studio-refresh-token";
const USER_KEY = "document-studio-user";

export interface AuthUser {
  id?: string;
  email?: string;
  displayName?: string;
  role?: string;
  isAdmin?: boolean;
  permissions?: string[];
  [key: string]: unknown;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser | null;
}

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryUser: AuthUser | null = null;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable — memory-only is fine for this session
  }
}

function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  return memoryAccessToken ?? readStorage(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return memoryRefreshToken ?? readStorage(REFRESH_TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (memoryUser) return memoryUser;
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    memoryUser = JSON.parse(raw) as AuthUser;
    return memoryUser;
  } catch {
    return null;
  }
}

/** @deprecated Prefer setAuthSession(). Kept for compatibility. */
export function setAccessToken(token: string): void {
  const trimmed = token.trim();
  if (!trimmed) {
    clearAuth();
    return;
  }
  memoryAccessToken = trimmed;
  writeStorage(ACCESS_TOKEN_KEY, trimmed);
}

export function setAuthSession(session: AuthSession): void {
  const accessToken = session.accessToken.trim();
  if (!accessToken) {
    clearAuth();
    return;
  }

  memoryAccessToken = accessToken;
  writeStorage(ACCESS_TOKEN_KEY, accessToken);

  if (session.refreshToken?.trim()) {
    memoryRefreshToken = session.refreshToken.trim();
    writeStorage(REFRESH_TOKEN_KEY, memoryRefreshToken);
  }

  if (session.user) {
    memoryUser = session.user;
    writeStorage(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearAccessToken(): void {
  clearAuth();
}

export function clearAuth(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  memoryUser = null;
  removeStorage(ACCESS_TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(USER_KEY);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.length > 0);
}

export function isAdminUser(user: AuthUser | null = getUser()): boolean {
  if (!user) return false;
  const role = user.role;
  if (role === "admin" || role === "system_admin") return true;
  if (user.isAdmin === true) return true;
  const permissions = user.permissions;
  if (
    permissions?.includes("admin") ||
    permissions?.includes("system_admin")
  ) {
    return true;
  }
  return false;
}

export function logoutAndRedirect(): void {
  clearAuth();
  const base = import.meta.env.BASE_URL || "/document-studio/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  window.location.href = `${normalized}login`;
}
