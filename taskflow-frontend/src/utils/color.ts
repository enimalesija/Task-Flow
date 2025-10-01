export const ONE_DAY = 24 * 60 * 60 * 1000;

export function formatDate(ts?: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString();
  } catch { return ""; }
}

export function isDueSoon(ts?: number) {
  if (!ts) return false;
  const now = Date.now();
  return ts > now && ts - now <= ONE_DAY;
}

export function isOverdue(ts?: number) {
  if (!ts) return false;
  return ts < Date.now();
}
