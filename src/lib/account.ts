export function redirectToAccount(action: "login" | "register" = "login") {
  const next = `${import.meta.env.BASE_URL || "/document-studio/"}${window.location.pathname
    .replace(import.meta.env.BASE_URL || "/document-studio/", "")
    .replace(/^\//, "")}`;
  window.location.href = `/auth/${action}?next=${encodeURIComponent(next)}`;
}
