/**
 * PORTAL BRIDGE — DOM -> WebGL.
 *
 * R3F and the React DOM tree render independently. This is the seam between
 * them, and it is deliberately NOT React state and NOT a Zustand hook:
 *
 *  - useState at 60fps re-renders the tree 60 times a second.
 *  - Zustand's useStore subscribes and re-renders too. Reading it imperatively
 *    with getState() inside useFrame works, but that is a module object with
 *    extra machinery — which is what this already is.
 *
 * Zustand stays where subscription is genuinely wanted: the cart.
 *
 * Mutable, module-scope, read directly in useFrame. `progress` is a plain
 * property access in the hot path.
 */
export const portalStore = {
  /** 0 = at rest, 1 = camera fully through the plane */
  progress: 0,
  /** live distance from camera to the cinematic plane, written by the camera */
  cameraDistance: 999,
};
