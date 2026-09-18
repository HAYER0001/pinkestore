"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX_3D } from "./shaders/noise.glsl";
import { scrubStore } from "@/utils/animations/scrub-store";

/**
 * MADHUBANI PARTICLES — gold dust and floating thread.
 *
 * ARCHITECTURE NOTE, up front, because it explains the whole design:
 * this shader is STATELESS. Every frame recomputes each particle from its
 * immutable origin. Nothing integrates velocity between frames.
 *
 * That buys us a huge amount — no FBO ping-pong, no read-back, 50k particles
 * for one draw call — but it costs one thing: a particle cannot "remember"
 * that it was pushed, so it would snap home the instant the cursor left.
 *
 * The spring-back therefore lives on the CPU: `uMouse` is a DAMPED follower of
 * the real cursor, so the repulsion CENTRE glides after the pointer and the
 * field eases back behind it. Visually identical to per-particle springs at a
 * fraction of the cost. Honest description: it is a lagging force field, not
 * integrated particle physics.
 */

const vertexShader = /* glsl */ `
${SIMPLEX_3D}

uniform float uTime;
uniform vec3  uMouse;
uniform float uScroll;
uniform float uPixelRatio;
uniform float uRepelRadius;
uniform float uRepelStrength;
uniform float uSizeScale;
uniform float uReveal;   // 0 = dust everywhere, 1 = parted to the edges

attribute float aSize;
attribute float aSpeed;
attribute float aMix;
attribute float aPhase;

varying float vMix;
varying float vTwinkle;
varying float vPush;
varying float vReveal;

void main() {
  vec3 origin = position;

  // ---- organic drift -------------------------------------------------
  // Three simplex samples on offset domains give a flow vector. This is a
  // noise FLOW FIELD, not true curl noise: real curl needs six samples for
  // finite-difference derivatives, and at 50k vertices that cost is not
  // repaid by the visual difference here.
  float t = uTime * 0.06 * aSpeed;
  vec3 q = origin * 0.085;

  vec3 flow = vec3(
    snoise(q + vec3(0.0, t, 0.0)),
    snoise(q + vec3(t, 0.0, 41.3)),
    snoise(q + vec3(17.7, 0.0, t))
  );

  // scroll adds turbulence: the field agitates as the page moves
  float turbulence = 1.0 + uScroll * 1.6;
  vec3 drifted = origin + flow * (0.9 + aSpeed * 0.7) * turbulence;

  // slow vertical rise, like dust in a sunbeam; wraps so the field never empties
  drifted.y += mod(uTime * 0.08 * aSpeed + aPhase * 10.0, 14.0) - 7.0;

  // ---- mouse repulsion -----------------------------------------------
  // infl is 1 at the cursor and 0 at uRepelRadius. Squaring it keeps the
  // gradient away from the boundary — a linear falloff leaves a visible hard
  // ring where the influence terminates.
  vec3  away = drifted - uMouse;
  float d    = length(away);
  float infl = 1.0 - smoothstep(0.0, uRepelRadius, d);
  vec3  dir  = away / max(d, 0.0001);            // guard the singularity at d==0
  float push = infl * infl;

  drifted += dir * push * uRepelStrength;
  vPush = push;

  // ---- the parting -----------------------------------------------------
  // As the sequence begins the field opens outward from the centre, so the
  // particles become a border around the footage rather than fog on top of
  // it. Pushed along the XY radial so depth is preserved.
  vec2  radial = drifted.xy;
  float rlen   = length(radial) + 0.0001;
  vec2  rdir   = radial / rlen;
  // particles already near the edge move least — the centre clears first
  float clearAmount = (1.0 - smoothstep(0.0, 13.0, rlen)) * uReveal;
  drifted.xy += rdir * clearAmount * 11.0;
  vReveal = uReveal;

  vec4 mvPosition = modelViewMatrix * vec4(drifted, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // ---- size attenuation ----------------------------------------------
  // -mvPosition.z is view-space depth. Dividing by it is the standard
  // perspective divide for points; multiplying by uPixelRatio keeps apparent
  // size constant across DPR instead of doubling on retina.
  float sizeBoost = 1.0 + push * 1.8;            // particles flare as they scatter
  gl_PointSize = aSize * uSizeScale * uPixelRatio * sizeBoost * (60.0 / -mvPosition.z);

  vMix = aMix;
  // fade in and out of the dark so the field breathes rather than sitting flat
  vTwinkle = 0.45 + 0.55 * (0.5 + 0.5 * snoise(vec3(aPhase * 31.0, uTime * 0.22 * aSpeed, 0.0)));
}
`;

const fragmentShader = /* glsl */ `
precision mediump float;

uniform vec3 uGold;
uniform vec3 uRed;
uniform vec3 uCream;

varying float vMix;
varying float vTwinkle;
varying float vPush;
varying float vReveal;

void main() {
  // distance from the centre of the point sprite
  vec2  uv = gl_PointCoord - 0.5;
  float d  = dot(uv, uv);          // squared distance — avoids a sqrt

  // Soft anti-aliased disc. smoothstep on the SQUARED distance, so the
  // thresholds are 0.25 (r=0.5) and 0.0025 (r=0.05).
  float disc = smoothstep(0.25, 0.0025, d);

  // Single early-out. This is one comparison on a value every lane already
  // has — not branching logic. It is worth it here because additive blending
  // on ~50k sprites is fill-rate bound, and killing the fully transparent
  // corners of every quad removes roughly 21% of blended fragments.
  if (disc <= 0.0) discard;

  // three-way palette mix, branchless
  vec3 c = mix(uGold, uRed,   smoothstep(0.0, 0.55, vMix));
  c      = mix(c,     uCream, smoothstep(0.55, 1.0, vMix));

  // scattered particles brighten toward cream as they are pushed
  c = mix(c, uCream, vPush * 0.6);

  // dust recedes as the footage takes over, but never fully — a thin veil of
  // gold over the cloth is the whole point
  float alpha = disc * vTwinkle * (0.55 + vPush * 0.45) * (1.0 - vReveal * 0.62);

  gl_FragColor = vec4(c, alpha);
}
`;

/**
 * Particle budget. A 3x-DPR phone rendering 50k additive sprites is fill-rate
 * suicide — the cost scales with PIXELS not vertices, so high DPR is the thing
 * to defend against, not CPU class.
 */
export function particleBudget() {
  if (typeof window === "undefined") return 20000;
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (w < 768) return dpr >= 3 ? 9000 : 14000;
  if (w < 1280) return dpr >= 2 ? 26000 : 34000;
  if (cores <= 4) return 30000;
  return 52000;
}

export function MadhubaniParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, pointer, size } = useThree();

  const count = useMemo(particleBudget, []);

  /* ---------- geometry: origins + per-particle attributes ---------- */
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    const mixes = new Float32Array(count);
    const phases = new Float32Array(count);

    /* Deterministic PRNG. Math.random would reshuffle the whole field on every
       hot reload and differ between SSR and client. */
    let seed = 0x2f6e2b1;
    const rnd = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
    };

    for (let i = 0; i < count; i++) {
      /* wide flat cylinder — reads as a horizontal drift of dust rather than
         a ball floating in the middle of the screen */
      const r = Math.sqrt(rnd()) * 17;
      const theta = rnd() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (rnd() - 0.5) * 11;
      pos[i * 3 + 2] = Math.sin(theta) * r * 0.55 - 2.0;

      sizes[i] = 0.5 + rnd() * rnd() * 3.2;  // rnd² → many small, few large
      speeds[i] = 0.35 + rnd() * 1.4;
      mixes[i] = rnd();
      phases[i] = rnd();
    }

    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    /* the field never leaves view, so skip per-frame frustum maths */
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40);
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3(999, 999, 999) },
          uScroll: { value: 0 },
          uPixelRatio: { value: 1 },
          uRepelRadius: { value: 3.4 },
          uRepelStrength: { value: 2.2 },
          uSizeScale: { value: 1 },
          uReveal: { value: 0 },
          uGold: { value: new THREE.Color("#D4AF37") },
          uRed: { value: new THREE.Color("#8B3A3A") },
          uCream: { value: new THREE.Color("#FAF8F5") },
        },
      }),
    [],
  );

  /* keep DPR uniform in sync — it changes when a window moves between displays */
  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    material.uniforms.uSizeScale.value = size.width < 768 ? 0.72 : 1;
  }, [material, size.width]);

  /* ---------- cursor → 3D, damped ---------- */
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 2), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const damped = useRef(new THREE.Vector3(999, 999, 999));
  const scrollSmooth = useRef(0);

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;

    /* Unproject the pointer onto a plane just in front of the field. */
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      /* Frame-rate independent damping: with a fixed lerp alpha the spring
         would be twice as fast at 120fps as at 60fps. */
      const k = 1 - Math.pow(0.0015, delta);
      damped.current.lerp(hit, k);
      u.uMouse.value.copy(damped.current);
    }

    /* Lenis velocity → turbulence, smoothed and clamped so a flick of the
       wheel cannot blow the field apart. */
    const lenis = (window as unknown as { lenis?: { velocity: number } }).lenis;
    const raw = Math.min(Math.abs(lenis?.velocity ?? 0) / 900, 1);
    scrollSmooth.current += (raw - scrollSmooth.current) * Math.min(1, delta * 4);
    u.uScroll.value = scrollSmooth.current;

    /* the field parts over the first 18% of the track, then holds open */
    const reveal = Math.min(scrubStore.getProgress() / 0.18, 1);
    u.uReveal.value += (reveal - u.uReveal.value) * Math.min(1, delta * 3);
  });

  /* ---------- GPU teardown ----------
     three.js buffers live outside the JS heap; React unmounting does not free
     them. Without this every hot reload leaks a full attribute set. */
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
