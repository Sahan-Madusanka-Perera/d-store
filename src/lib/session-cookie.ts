/**
 * Read the signed-in user straight out of the Supabase auth cookie.
 *
 * `supabase.auth.getSession()` / `signOut()` hang under Turbopack — ProductManager has
 * carried a comment about this and its own cookie reader since before any of this work.
 * Anything that awaits those calls to decide what to render inherits the hang: the
 * navbar's account icon sat in its grey, non-interactive loading skeleton forever
 * because `loading` was only cleared after `getSession()` resolved.
 *
 * This is synchronous and cannot hang, so the UI can start from the right state instead
 * of waiting to find out. `onAuthStateChange` still runs on top for live updates.
 *
 * Reads only — never a substitute for server-side verification. The middleware and
 * every API route still call `supabase.auth.getUser()`, which validates against the
 * auth server; a forged cookie would change the navbar and nothing else.
 */

export interface CookieSessionUser {
  id: string;
  email?: string;
}

export function readUserFromCookie(): CookieSessionUser | null {
  if (typeof document === 'undefined') return null;

  try {
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
      .replace('https://', '')
      .split('.')[0];
    if (!projectRef) return null;

    const prefix = `sb-${projectRef}-auth-token`;
    const cookies = document.cookie.split(';').map(c => c.trim());

    // @supabase/ssr writes one cookie, or splits it into .0/.1/... when it is too long.
    let raw: string | null = null;

    const single = cookies.find(c => c.startsWith(`${prefix}=`));
    if (single) {
      raw = decodeURIComponent(single.split('=').slice(1).join('='));
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < 10; i++) {
        const chunk = cookies.find(c => c.startsWith(`${prefix}.${i}=`));
        if (!chunk) break;
        chunks.push(decodeURIComponent(chunk.split('=').slice(1).join('=')));
      }
      if (chunks.length > 0) raw = chunks.join('');
    }

    if (!raw) return null;
    if (raw.startsWith('base64-')) raw = atob(raw.slice(7));

    const parsed = JSON.parse(raw);
    const user = parsed?.user ?? parsed?.currentSession?.user;
    if (!user?.id) return null;

    return { id: user.id, email: user.email };
  } catch {
    // A malformed or half-written cookie means "not signed in", not a crash.
    return null;
  }
}
