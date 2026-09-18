"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { portalStore } from "@/utils/animations/portal-store";

/**
 * CAMERA CONTROLLER
 *
 * Drives camera.position.z from the portal scroll progress, so the viewer is
 * pushed through the cinematic plane rather than the plane moving toward them.
 *
 * WHY LERP TOWARD A TARGET INSTEAD OF ASSIGNING IT
 * Lenis already smooths scroll, but ScrollTrigger progress still lands in
 * discrete steps. Assigning camera.z directly makes those steps visible as
 * micro-stutter at exactly the moment the shot is most cinematic. Lerping
 * toward the target adds a second order of smoothing and gives the push real
 * mass — it glides to a stop even if the wheel is flicked and released.
 *
 * The lerp factor is frame-rate independent: a fixed alpha would make the
 * camera arrive twice as fast at 120fps as at 60fps.
 */

const Z_REST = 14;   // matches GlobalCanvas's initial camera
const Z_THROUGH = -6; // past the plane at z = -3
const PLANE_Z = -3;

export function CameraController() {
  const camera = useThree((s) => s.camera);
  const targetZ = useRef(Z_REST);

  /* Restore the resting position if this unmounts mid-flight, otherwise a
     client-side route change leaves the camera buried inside the scene. */
  useEffect(() => {
    const cam = camera;
    return () => {
      cam.position.z = Z_REST;
      cam.updateProjectionMatrix();
    };
  }, [camera]);

  useFrame((_, delta) => {
    const p = portalStore.progress;

    /* Ease the mapping itself so the push accelerates into the plane rather
       than travelling at constant speed — constant-velocity dollies read as
       machinery, not cinema. */
    const eased = p * p * (3 - 2 * p);
    targetZ.current = THREE.MathUtils.lerp(Z_REST, Z_THROUGH, eased);

    const k = 1 - Math.pow(0.0025, delta);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, k);

    /* Publish the live distance for the dissolve shader. Signed, so the value
       keeps falling as the camera passes through and the hole stays open. */
    portalStore.cameraDistance = camera.position.z - PLANE_Z;
  });

  return null;
}
