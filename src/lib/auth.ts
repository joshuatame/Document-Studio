const TOKEN_STORAGE_KEY = "document-studio-access-token";

let memoryToken: string | null = null;

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return memoryToken ?? readStoredToken();
}

export function setAccessToken(token: string): void {
  const trimmed = token.trim();
  if (!trimmed) {
    clearAccessToken();
    return;
  }
  memoryToken = trimmed;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
  } catch {
    // localStorage unavailable — memory-only is fine for this session
  }
}

export function clearAccessToken(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.length > 0);
}
