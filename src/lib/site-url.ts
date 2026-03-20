/**
 * Canonical URL for SEO, Open Graph, sitemap, and robots.
 * Prefer NEXT_PUBLIC_SITE_URL when the domain you share (e.g. beta) differs
 * from NEXT_PUBLIC_DEPLOYMENT_URL (e.g. used for Telegram or other links).
 */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const host = (
    process.env.NEXT_PUBLIC_DEPLOYMENT_URL ?? "beta.heyanna.trade"
  ).replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}`;
}
