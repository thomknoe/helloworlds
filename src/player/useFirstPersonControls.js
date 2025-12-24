import { useEffect, useRef } from "react";
import * as THREE from "three";

import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";

export default function useFirstPersonControls(
  playerRef,
  cameraRef,
  isAuthorModeRef,
  terrainConfigRef
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

  const isLocked = useRef(false);

  useEffect(() => {
    const lockChange = () => {
      isLocked.current = document.pointerLockElement === document.body;
    };
    document.addEventListener("pointerlockchange", lockChange);
    return () => document.removeEventListener("pointerlockchange", lockChange);
  }, []);

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

  useEffect(() => {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    const step = () => {
      requestAnimationFrame(step);
      const player = playerRef.current;
      const cam = cameraRef.current;
      if (!player || !cam) return;

      player.rotation.y = yaw.current;
      cam.rotation.x = pitch.current;

      let dx = 0;
      let dz = 0;
      if (move.current.forward) dz += speed;
      if (move.current.backward) dz -= speed;
      if (move.current.left) dx -= speed;
      if (move.current.right) dx += speed;

      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      right.crossVectors(forward, up).normalize();

      player.position.addScaledVector(forward, dz);
      player.position.addScaledVector(right, dx);

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
