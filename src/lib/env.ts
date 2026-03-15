/**
 * Required environment variables.
 *
 * Uses lazy getters so each var is only validated when first accessed,
 * and literal process.env.NEXT_PUBLIC_* access so Next.js can inline
 * values into client bundles at build time.
 */

export const env = {
  get TELEGRAM_BOT_USERNAME(): string {
    const value = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!value) throw new Error("Missing required environment variable: NEXT_PUBLIC_TELEGRAM_BOT_USERNAME");
    return value.replace(/^@/, "");
  },
  get API_URL(): string {
    const value = process.env.NEXT_PUBLIC_API_URL;
    if (!value) throw new Error("Missing required environment variable: NEXT_PUBLIC_API_URL");
    return value;
  },
  get DEPLOYMENT_URL(): string {
    const value = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
    if (!value) throw new Error("Missing required environment variable: NEXT_PUBLIC_DEPLOYMENT_URL");
    return value;
  },
  get TG_BOT_URL(): string {
    return `https://t.me/${this.TELEGRAM_BOT_USERNAME}`;
  },
};
