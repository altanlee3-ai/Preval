import "server-only";

/**
 * Small in-memory rate limiter, so a public website can't use up the AI key's free quota.
 * Limits are per visitor IP address and reset when the server restarts.
 */
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, bucket: string, perMinute: number, perDay: number): string | null {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 86_400_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= perMinute) return "Too many requests. Please wait a minute and try again.";
  if (list.length >= perDay) return "Daily limit reached for live AI on this website. Try again tomorrow.";
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 86_400_000)) hits.delete(k);
  return null;
}
