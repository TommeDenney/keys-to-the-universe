// Stars: every result is out of 5 (like a dance game): three small stars, a bigger
// fourth and a big, animated fifth for a near-perfect run.

export const MAX_STARS = 5;

/** Saves from the 3-star days: 3★ (90%+) → 5★, 2★ → 3★, 1★ → 2★. */
export const fromThreeStars = (s) => [0, 2, 3, 5][s] ?? s;

/** Convert a saved state (or a backup's state) to 5 stars, once. */
export function migrateStars(st) {
  if (!st || st.starScale === MAX_STARS) return false;
  const hasAny = Object.keys(st.lessons || {}).length || Object.keys(st.songs || {}).length;
  st.starScale = MAX_STARS;
  if (!hasAny) return true;
  for (const rec of Object.values(st.lessons || {})) if (rec && rec.stars) rec.stars = fromThreeStars(rec.stars);
  for (const id of Object.keys(st.paid || {})) st.paid[id] = fromThreeStars(st.paid[id]);
  for (const steps of Object.values(st.songs || {})) for (const k of Object.keys(steps)) steps[k] = fromThreeStars(steps[k]);
  return true;
}
