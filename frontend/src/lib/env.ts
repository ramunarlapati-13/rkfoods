/**
 * Environment Variable Validator & Typed Access
 * ─────────────────────────────────────────────
 * All credentials are accessed through this module.
 *
 * Security model:
 *   NEXT_PUBLIC_* → Bundled into client JS. Safe for Supabase Web SDK config only.
 *   (no prefix)  → Server-only. Never exposed to the browser.
 */

// ── Validation helper ────────────────────────────────────────────────────────
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    // Return placeholder during build / local dev to prevent static prerendering crashes
    console.warn(
      `[ENV WARNING] Missing environment variable: "${key}".\n` +
      `  → For local dev: copy .env.local.example to .env.local and fill in the value.`
    );
    return '';
  }
  return value.trim();
}

// ── Client-safe Supabase Web SDK config (NEXT_PUBLIC_) ───────────────────────
export const clientEnv = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
} as const;
