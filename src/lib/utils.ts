/** Tiny class-name joiner. Falsy values are dropped. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * Deterministic pseudo-random number generator.
 * The coded art-direction plates need scattered-looking geometry that is
 * identical on the server and the client, so `Math.random` cannot be used.
 */
export function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Hash a string into a stable integer seed. */
export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Split a string into words, preserving them as atomic spans for reveals. */
export function toWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}
