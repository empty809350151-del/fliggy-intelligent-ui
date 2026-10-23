// The API routes have no sign-in, so they accept browser requests only from this app's own pages,
// as the OpenUI docs chat does. A request without an Origin header (a script, curl) is refused, so
// it can't spend the demo's Gateway credit from outside the page.
//
// Allowed: the origin the request was addressed to, the host a proxy forwarded it for, and any
// origins in ALLOWED_ORIGINS (comma-separated, e.g. a preview domain).
export function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  let normalized: string;
  try {
    normalized = new URL(origin).origin;
  } catch {
    return false;
  }
  if (normalized !== origin) return false;

  const allowed = new Set([new URL(request.url).origin]);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
    allowed.add(`${proto}://${host}`);
  }
  for (const entry of (process.env.ALLOWED_ORIGINS ?? "").split(",")) {
    try {
      if (entry.trim()) allowed.add(new URL(entry.trim()).origin);
    } catch {
      // A malformed entry is ignored rather than broadening access.
    }
  }
  if (allowed.has(normalized)) return true;

  // Some local browser/network integrations strip the Origin port. Accept only
  // development loopback requests with an exact same-origin Referer and Fetch Metadata.
  if (process.env.NODE_ENV === "development" && request.headers.get("sec-fetch-site") === "same-origin") {
    try {
      const source = new URL(origin);
      const referer = new URL(request.headers.get("referer") ?? "");
      const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
      return loopback.has(source.hostname) && source.port === "" &&
        referer.hostname === source.hostname && referer.protocol === source.protocol &&
        allowed.has(referer.origin);
    } catch {
      return false;
    }
  }
  return false;
}
