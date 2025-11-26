// src/player/useFirstPersonControls.js
import { useEffect, useRef } from "react";
import * as THREE from "three";

// ⬅ This is now the ONLY terrain height sampler used
import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";

export default function useFirstPersonControls(
  playerRef,
  cameraRef,
  isAuthorModeRef,
  terrainConfigRef // we add a ref so terrainConfig stays available inside the loop
) {
  const move = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const yaw = useRef(0);
  const pitch = useRef(0);

  const speed = 0.2;
  const mouseSensitivity = 0.002;

  // Camera height above ground

  // -------------------------
  // Pointer lock state
  // -------------------------
  const isLocked = useRef(false);

  useEffect(() => {
    const lockChange = () => {
      isLocked.current = document.pointerLockElement === document.body;
    };
    document.addEventListener("pointerlockchange", lockChange);
    return () => document.removeEventListener("pointerlockchange", lockChange);
  }, []);

  // -------------------------
  // Mouse look
  // -------------------------
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * mouseSensitivity;
      pitch.current -= e.movementY * mouseSensitivity;
      pitch.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitch.current)
      );
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // -------------------------
  // Keyboard
  // -------------------------
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "KeyW") move.current.forward = true;
      if (e.code === "KeyS") move.current.backward = true;
      if (e.code === "KeyA") move.current.left = true;
      if (e.code === "KeyD") move.current.right = true;
    };
    const onKeyUp = (e) => {
      if (e.code === "KeyW") move.current.forward = false;
      if (e.code === "KeyS") move.current.backward = false;
      if (e.code === "KeyA") move.current.left = false;
      if (e.code === "KeyD") move.current.right = false;
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // -------------------------
  // Movement + terrain following
  // -------------------------
  useEffect(() => {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    const step = () => {
      requestAnimationFrame(step);
      const player = playerRef.current;
      const cam = cameraRef.current;
      if (!player || !cam) return;

      // Mouse look
      player.rotation.y = yaw.current;
      cam.rotation.x = pitch.current;

      // WASD
      let dx = 0;
      let dz = 0;
      if (move.current.forward) dz += speed;
      if (move.current.backward) dz -= speed;
      if (move.current.left) dx -= speed;
      if (move.current.right) dx += speed;

      // Camera forward vector (flattened)
      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      // Camera right vector
      right.crossVectors(forward, up).normalize();

      // Apply movement
      player.position.addScaledVector(forward, dz);
      player.position.addScaledVector(right, dx);

      // -------------------------------------------------------
      // TRUE TERRAIN FOLLOWING (Perlin-driven mesh)
      // -------------------------------------------------------
      const cfg = terrainConfigRef?.current;
      if (cfg) {
        const groundY = sampleTerrainHeight(
          player.position.x,
          player.position.z,
          cfg
        );
        player.position.y = groundY;
      }
    };

    step();
  }, [cameraRef, playerRef, terrainConfigRef]);
}
