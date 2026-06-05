/**
 * Environment Variable Validator & Typed Access
 * ─────────────────────────────────────────────
 * All sensitive credentials are accessed ONLY through this module.
 * The app will throw at startup if any required variable is missing —
 * preventing silent failures with undefined keys in production.
 *
 * Security model:
 *   NEXT_PUBLIC_* → Bundled into client JS. Safe for Firebase Web SDK config only.
 *   (no prefix)  → Server-only. Never exposed to the browser. Used in API routes.
 *
 * Vault: Store all variables in Vercel Dashboard → Settings → Environment Variables.
 *        For local dev, copy .env.local.example → .env.local and fill in values.
 */

// ── Validation helper ────────────────────────────────────────────────────────
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `[ENV ERROR] Missing required environment variable: "${key}"\n` +
      `  → Add it to Vercel Dashboard > Settings > Environment Variables\n` +
      `  → For local dev: copy .env.local.example to .env.local and fill in the value`
    );
  }
  return value.trim();
}

// ── Client-safe Firebase Web SDK config (NEXT_PUBLIC_) ───────────────────────
// These are intentionally public — Firebase Web SDK requires them in the browser.
// Security is enforced via Firestore Rules + Storage Rules, NOT by hiding these keys.
export const clientEnv = {
  firebase: {
    apiKey:            requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain:        requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId:         requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket:     requireEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId:             requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  },
} as const;

// ── Server-only secrets (no NEXT_PUBLIC_ prefix) ─────────────────────────────
// These are NEVER bundled to the client. Used in Next.js API routes only.
// Add them to Vercel as "Server" environment variables (not "Client").
function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[SECURITY] Server-only env accessed on the client side. ' +
      'Move this call into an API route or server component.'
    );
  }
  return {
    firebase: {
      // Firebase Admin SDK service account (for privileged server operations)
      // Generate at: Firebase Console → Project Settings → Service Accounts → Generate new private key
      adminProjectId:   requireEnv('FIREBASE_ADMIN_PROJECT_ID'),
      adminClientEmail: requireEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
      // The private key contains newlines — store as-is in Vercel; Next.js handles the escaping
      adminPrivateKey:  requireEnv('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n'),
    },
  } as const;
}

export { getServerEnv };
