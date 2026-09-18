"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/utils/animations/gsap";
import { preloadFrames, sequenceSrc, FRAME_COUNT } from "@/utils/FramePreloader";
import { scrubStore } from "@/utils/animations/scrub-store";

/**
 * CINEMATIC SCRUBBER
 *
 * A viewport-filling plane whose texture is an image sequence scrubbed by
 * scroll. Three rules keep it at 60fps:
 *
 *  1. ONE texture for the whole sequence. Constructing a THREE.Texture per
 *     frame would allocate and free 144 GPU objects per pass — the garbage
 *     collector alone would blow the frame budget.
 *  2. The GPU upload happens ONLY when the integer frame index changes.
 *     Scroll fires far more often than the sequence advances; without this
 *     guard we would re-upload the same bitmap dozens of times a second.
 *  3. We draw into a 2D canvas and wrap it in a CanvasTexture. That lets us
 *     letterbox/cover-fit once per frame on the CPU rather than doing UV
 *     gymnastics in the shader for a non-matching aspect ratio.
 */

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Fragment: chromatic aberration + grain, both scaled by scroll velocity so
 * the treatment only appears while the user is actually moving. At rest the
 * image is clean — the effect reads as motion, not as a filter.
 */
const fragmentShader = /* glsl */ `
precision mediump float;

uniform sampler2D uTexture;
uniform float uVelocity;   // 0..1 smoothed scroll speed
uniform float uOpacity;
uniform float uTime;

varying vec2 vUv;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;

  // aberration grows from the centre outward, so edges smear and the middle
  // stays readable — the opposite looks like a broken screen
  vec2 fromCentre = uv - 0.5;
  float amount = uVelocity * 0.006;
  vec2 off = fromCentre * amount;

  float r = texture2D(uTexture, uv + off).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - off).b;
  vec3 col = vec3(r, g, b);

  // subtle film grain, animated, stronger while moving
  float grain = hash(uv * vec2(1920.0, 1080.0) + fract(uTime) * 91.7) - 0.5;
  col += grain * (0.018 + uVelocity * 0.03);

  // Only the last few percent at the extreme corners are touched, so the frame
  // reads full-bleed. The previous curve started dimming at 35% from centre,
  // which made a full-viewport plane look like an inset photograph.
  float vig = smoothstep(1.35, 0.72, length(fromCentre));
  col *= mix(1.0, vig, 0.35);

  gl_FragColor = vec4(col, uOpacity);
}
`;

const PLANE_Z = -3;

export function CinematicScrubber() {
  const { viewport, size, camera } = useThree();
  const lowRes = size.width < 768;

  const meshRef = useRef<THREE.Mesh>(null);
  const [gateReady, setGateReady] = useState(false);

  /* ---------- offscreen canvas + single texture ---------- */
  const { canvas, ctx, texture } = useMemo(() => {
    /* The backing canvas matches the VIEWPORT aspect, not the footage aspect.
       Cover-fitting 16:9 source into a 16:9 canvas and then stretching that
       onto a portrait plane would squash the image; matching the viewport here
       means the crop happens once, correctly, on the axis that actually
       overflows. */
    const c = document.createElement("canvas");
    const long = lowRes ? 720 : 1280;
    const ar = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 16 / 9;
    if (ar >= 1) {
      c.width = long;
      c.height = Math.round(long / ar);
    } else {
      c.height = long;
      c.width = Math.round(long * ar);
    }
    const context = c.getContext("2d", { alpha: false });
    if (context) {
      context.fillStyle = "#0A0B10";
      context.fillRect(0, 0, c.width, c.height);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return { canvas: c, ctx: context, texture: t };
  }, [lowRes]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [texture],
  );

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);

  /* ---------- preload ---------- */
  const seq = useMemo(
    () =>
      preloadFrames({
        count: FRAME_COUNT,
        src: (i) => sequenceSrc(i, lowRes),
        gate: 30,
        concurrency: 6,
        onProgress: (n, total) => scrubStore.setLoad(n / total),
      }),
    [lowRes],
  );

  useEffect(() => {
    let alive = true;
    seq.ready.then(() => {
      if (!alive) return;
      setGateReady(true);
      scrubStore.setReady(true);
    });
    return () => {
      alive = false;
      seq.dispose();
    };
  }, [seq]);

  /* ---------- ScrollTrigger drives a target, useFrame lerps toward it ---------- */
  const target = useRef(0);
  const current = useRef(0);
  const lastIndex = useRef(-1);
  const velocity = useRef(0);

  useEffect(() => {
    const el = document.getElementById("scrub-track");
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: false, // we do our own lerp; GSAP scrub would fight it
      onUpdate: (self) => {
        target.current = self.progress * (FRAME_COUNT - 1);
        scrubStore.setProgress(self.progress);
      },
    });

    return () => st.kill();
  }, []);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;

    /* frame-rate independent glide toward the scroll target */
    const k = 1 - Math.pow(0.0008, delta);
    const prev = current.current;
    current.current += (target.current - current.current) * k;

    /* how fast the sequence itself is moving, normalised, for the shader */
    const framesPerSec = Math.abs(current.current - prev) / Math.max(delta, 0.0001);
    velocity.current += (Math.min(framesPerSec / 26, 1) - velocity.current) * Math.min(1, delta * 6);
    material.uniforms.uVelocity.value = velocity.current;

    /* fade the plane in only once frames exist */
    const wantOpacity = gateReady ? 1 : 0;
    material.uniforms.uOpacity.value +=
      (wantOpacity - material.uniforms.uOpacity.value) * Math.min(1, delta * 2.5);

    /* THE GUARD: upload to the GPU only when the integer frame actually changes */
    const index = Math.round(current.current);
    if (index !== lastIndex.current && ctx) {
      const img = seq.nearest(index);
      if (img && img.naturalWidth > 0) {
        /* cover-fit into the canvas so any source aspect works */
        const ca = canvas.width / canvas.height;
        const ia = img.naturalWidth / img.naturalHeight;
        let dw = canvas.width;
        let dh = canvas.height;
        if (ia > ca) dw = dh * ia;
        else dh = dw / ia;
        ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
        texture.needsUpdate = true;
        lastIndex.current = index;
      }
    }

    /* Size the plane at ITS OWN depth.
       `viewport.width/height` describes the frustum at z=0. The plane sits at
       z=-3, which is further from the camera, so the frustum there is WIDER —
       using the z=0 numbers leaves a visible gap at every edge. */
    if (meshRef.current) {
      const v = viewport.getCurrentViewport(camera, [0, 0, PLANE_Z]);
      meshRef.current.scale.set(v.width, v.height, 1);
    }
  });

  /* ---------- teardown ---------- */
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, PLANE_Z]} frustumCulled={false} />
  );
}
