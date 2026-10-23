import parentOrigins from '../../public/embed-parent-origins.json';
// Exact parent origins only. Set at build/dev startup; no wildcard or null origin.
export const EMBED_PARENT_ORIGINS = (process.env.NEXT_PUBLIC_EMBED_PARENT_ORIGINS ?? parentOrigins.join(',')).split(',').map(s => s.trim()).filter(s => {
  try {const u = new URL(s); return ['http:', 'https:'].includes(u.protocol) && u.origin === s;} catch {return false;}
});
