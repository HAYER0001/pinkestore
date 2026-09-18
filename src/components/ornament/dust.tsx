"use client";

import { useEffect, useMemo, useState } from "react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useReducedMotion } from "motion/react";

/**
 * Floating dust — near-subliminal by design. This is the light in a shop where
 * cloth is being folded, not a particle demo.
 *
 * tsparticles v4 replaced initParticlesEngine with <ParticlesProvider init={}>.
 * Cheap by construction: no links, no collisions, no hover interactivity, and
 * it does not mount at all under reduced-motion, on narrow screens, or on
 * low-core devices.
 */

const init = async (engine: Engine) => {
  await loadSlim(engine);
};

export function Dust({ density = 24 }: { density?: number }) {
  const [allowed, setAllowed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const check = () =>
      setAllowed(
        window.innerWidth >= 640 && (navigator.hardwareConcurrency ?? 4) > 2,
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      detectRetina: true,
      fpsLimit: 45,
      particles: {
        number: {
          value: density,
          density: { enable: true, width: 1600, height: 900 },
        },
        color: { value: ["#D6A93C", "#E0D9D1"] },
        opacity: {
          value: { min: 0.05, max: 0.2 },
          animation: { enable: true, speed: 0.3, sync: false },
        },
        size: { value: { min: 0.7, max: 2 } },
        move: {
          enable: true,
          speed: { min: 0.08, max: 0.3 },
          direction: "top",
          straight: false,
          random: true,
          outModes: { default: "out" },
        },
        links: { enable: false },
        collisions: { enable: false },
        shape: { type: "circle" },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
    }),
    [density],
  );

  if (reduced || !allowed) return null;

  return (
    <ParticlesProvider init={init}>
      <Particles
        id="pk-dust"
        options={options}
        className="pointer-events-none absolute inset-0"
      />
    </ParticlesProvider>
  );
}
