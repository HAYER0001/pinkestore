"use client";

/**
 * ADAPTIVE TIERING — the melt-proof strategy.
 *
 * The cost that actually kills a phone here is FILL RATE, not vertex count:
 * 50k additively-blended sprites on a 3x-DPR screen is ~9x the pixels of the
 * same scene at 1x. So devicePixelRatio is weighted heavily and core count
 * only breaks ties.
 *
 * deviceMemory and hardwareConcurrency are both absent on Safari, so every
 * read is defensive and the DEFAULT on unknown hardware is the middle tier,
 * never the top one. Guessing high on an unknown device is how you melt it.
 */

export type Tier = "high" | "mid" | "low";

export interface DeviceProfile {
  tier: Tier;
  particles: number;
  /** low-res frame sequence (560px) instead of 1024px */
  lowResSequence: boolean;
  /** custom cursor, tsparticles, velocity distortion */
  enrichment: boolean;
  dpr: number;
}

const SSR: DeviceProfile = {
  tier: "mid",
  particles: 20000,
  lowResSequence: false,
  enrichment: false,
  dpr: 1,
};

export function detectDevice(): DeviceProfile {
  if (typeof window === "undefined") return SSR;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* A coarse pointer under 768px is a phone regardless of what it claims about
     cores — a modern flagship reports 8 and will still cook under 50k sprites
     because the screen is 3x. */
  const isPhone = coarse && w < 768;
  const isWeak = cores <= 4 || mem <= 4;

  if (isPhone || (isWeak && w < 1280)) {
    return {
      tier: "low",
      /* the mobile cut: 50k -> 10k */
      particles: 10000,
      lowResSequence: true,
      enrichment: false,
      dpr: Math.min(dpr, 2),
    };
  }

  if (w < 1280 || isWeak || !fine) {
    return {
      tier: "mid",
      particles: 26000,
      lowResSequence: w < 1024,
      enrichment: fine,
      dpr,
    };
  }

  return {
    tier: "high",
    particles: 52000,
    lowResSequence: false,
    enrichment: true,
    dpr,
  };
}
