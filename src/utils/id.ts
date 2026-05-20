// Lightweight id generator. Good enough for in-memory round ids.
export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
