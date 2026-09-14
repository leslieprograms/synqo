/** Deterministic string hash used to derive stable colors from a seed. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Produces a deterministic two-stop gradient string from a seed.
 * Used as the cover-art fallback so every item still reads as
 * colorful and distinct even without real poster art wired up.
 */
export function gradientForSeed(seed: string): string {
  const hash = hashString(seed);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40 + (hash % 30)) % 360;
  const sat = 55 + (hash % 15);
  const light1 = 28 + (hash % 10);
  const light2 = 12 + (hash % 8);
  return `linear-gradient(155deg, hsl(${hue1} ${sat}% ${light1}%), hsl(${hue2} ${sat}% ${light2}%))`;
}

export function avatarColorForSeed(seed: string): string {
  const hash = hashString(seed);
  const hue = hash % 360;
  return `hsl(${hue} 45% 42%)`;
}
