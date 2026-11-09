/**
 * Parses absolute URLs, and bare host inputs like "localhost:3000" by
 * assuming http://. Non-HTTP(S) schemes return null so callers can fall
 * back to their own handling.
 */
function parseUrl(input: string): URL | null {
  try {
    const direct = new URL(input);
    if (direct.protocol === "http:" || direct.protocol === "https:") {
      return direct;
    }
  } catch {
    // Not parseable as-is; try the prefixed attempt below.
  }

  try {
    return new URL(`http://${input}`);
  } catch {
    return null;
  }
}

/**
 * Matches localhost and its DNS aliases plus the loopback address ranges
 * (127.0.0.0/8 and ::1), with or without a scheme, port, or path.
 */
export function isLocalhostUrl(input: string): boolean {
  const url = parseUrl(input);
  if (!url) return false;

  const host = url.hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "[::1]") return true;

  if (host.startsWith("127.")) {
    const parts = host.split(".");
    return (
      parts.length === 4 &&
      parts.every((part) => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const octet = Number(part);
        return octet >= 0 && octet <= 255;
      })
    );
  }

  return false;
}
