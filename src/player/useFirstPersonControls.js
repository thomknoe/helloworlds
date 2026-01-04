import { useEffect, useRef } from "react";
import * as THREE from "three";

import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";
import { playerConfig } from "./playerConfig.js";
import { defaultTerrainConfig } from "../world/terrain/terrainConfig.js";

// Default terrain config matching the initial terrain creation
// This matches defaultTerrainConfig used when terrain is first created
const defaultPerlinConfig = {
  type: "perlinNoise",
  seed: 42,
  noiseScale: defaultTerrainConfig.noiseScale, // 0.02
  octaves: 4,
  persistence: 0.5,
  amplitude: defaultTerrainConfig.amplitude, // 18
  frequency: 1,
};

// Constants for out-of-bounds falling behavior
const FALL_TELEPORT_TIME = 10000; // 10 seconds in milliseconds
const FALL_TELEPORT_DEPTH = -1000; // Teleport if falling below this depth

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
  const jumpVelocity = 0.3; // Increased for more powerful jump
  const gravity = 0.01; // Reduced for slower, more graceful descent
  const groundThreshold = 0.1; // How close to ground to be considered "on ground"

  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isOnGround = useRef(false);

  const isLocked = useRef(false);
  const isOutOfBounds = useRef(false);
  const fallStartTime = useRef(null);

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
      if (e.code === "Space") {
        e.preventDefault(); // Prevent spacebar from scrolling
        // Jump when on ground (only allow single jump)
        if (isOnGround.current) {
          velocity.current.y = jumpVelocity;
          isOnGround.current = false;
        }
      }
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
    let initialized = false;

    const step = () => {
      requestAnimationFrame(step);
      const player = playerRef.current;
      const cam = cameraRef.current;
      if (!player || !cam) return;

      // Initialize player position on terrain surface on first frame
      // Use default Perlin parameters if terrain config not available yet
      if (!initialized) {
        const cfg = terrainConfigRef?.current || defaultPerlinConfig;
        const groundY = sampleTerrainHeight(
          player.position.x,
          player.position.z,
          cfg
        );
        player.position.y = groundY; // Player position is at terrain level
        isOnGround.current = true;
        initialized = true;
      }

      // Apply rotation directly to camera (first-person style, not orbital)
      cam.rotation.order = "YXZ"; // Yaw then pitch (standard FPS order)
      cam.rotation.y = yaw.current;
      cam.rotation.x = pitch.current;

      // Calculate movement direction based on camera rotation
      cam.getWorldDirection(forward);
      forward.y = 0; // Keep movement horizontal
      forward.normalize();

      right.crossVectors(forward, up).normalize();

      // Calculate movement amounts (forward/backward and left/right)
      let forwardAmount = 0;
      let rightAmount = 0;
      if (move.current.forward) forwardAmount += speed; // W = forward
      if (move.current.backward) forwardAmount -= speed; // S = backward
      if (move.current.left) rightAmount -= speed; // A = left (negative right)
      if (move.current.right) rightAmount += speed; // D = right (positive right)

      // Apply horizontal movement
      if (isOnGround.current) {
        // On ground: apply movement directly (instant response)
        velocity.current.x = forwardAmount * forward.x + rightAmount * right.x;
        velocity.current.z = forwardAmount * forward.z + rightAmount * right.z;
      } else {
        // In air: preserve momentum (keep horizontal velocity from jump)
        // Horizontal velocity is maintained, no air control
      }

      // Apply gravity
      velocity.current.y -= gravity;

      // Get terrain bounds
      const terrainCfg = terrainConfigRef?.current;
      const terrainWidth = terrainCfg?.width || defaultTerrainConfig.width;
      const terrainDepth = terrainCfg?.depth || defaultTerrainConfig.depth;
      const halfWidth = terrainWidth / 2;
      const halfDepth = terrainDepth / 2;

      // Check if player is outside terrain bounds
      const wasOutOfBounds = isOutOfBounds.current;
      isOutOfBounds.current =
        player.position.x < -halfWidth ||
        player.position.x > halfWidth ||
        player.position.z < -halfDepth ||
        player.position.z > halfDepth;

      // Start tracking fall time when first going out of bounds
      if (isOutOfBounds.current && !wasOutOfBounds) {
        fallStartTime.current = performance.now();
      }

      // Reset fall time when back in bounds
      if (!isOutOfBounds.current && wasOutOfBounds) {
        fallStartTime.current = null;
      }

      // Update player position with velocity
      player.position.x += velocity.current.x;
      player.position.y += velocity.current.y;
      player.position.z += velocity.current.z;

      // If out of bounds, check for teleport conditions
      if (isOutOfBounds.current) {
        const fallDuration = fallStartTime.current
          ? performance.now() - fallStartTime.current
          : 0;

        // Teleport if fallen too long or too deep
        if (
          fallDuration >= FALL_TELEPORT_TIME ||
          player.position.y <= FALL_TELEPORT_DEPTH
        ) {
          // Teleport to center of terrain
          const cfg = terrainConfigRef?.current || defaultPerlinConfig;
          const centerGroundY = sampleTerrainHeight(0, 0, cfg);

          player.position.set(0, centerGroundY, 0);
          velocity.current.set(0, 0, 0);
          isOnGround.current = true;
          isOutOfBounds.current = false;
          fallStartTime.current = null;

          // Skip rest of collision detection since we just teleported
          cam.position.set(0, playerConfig.eyeHeight, 0);
          return;
        }
      }

      // Ground collision and height adjustment
      // Use default Perlin config if terrain config not available
      const cfg = terrainConfigRef?.current || defaultPerlinConfig;

      // Only check ground collision if in bounds
      let groundY;
      if (isOutOfBounds.current) {
        // When out of bounds, use a very low ground level so player keeps falling
        groundY = FALL_TELEPORT_DEPTH - 100;
      } else {
        groundY = sampleTerrainHeight(
          player.position.x,
          player.position.z,
          cfg
        );
      }

      // Check if on ground (only apply if in bounds)
      const distanceFromGround = player.position.y - groundY;

      // Only apply ground collision if in bounds
      if (!isOutOfBounds.current) {
        if (player.position.y <= groundY) {
          // Player is at or below ground - push them up to ground level
          player.position.y = groundY;
          velocity.current.y = 0; // Stop any downward/upward velocity when colliding with ground
          isOnGround.current = true;

          // Reset horizontal velocity when landing and no input
          if (
            !move.current.forward &&
            !move.current.backward &&
            !move.current.left &&
            !move.current.right
          ) {
            velocity.current.x = 0;
            velocity.current.z = 0;
          }
        } else if (
          distanceFromGround <= groundThreshold &&
          velocity.current.y <= 0
        ) {
          // Player is very close to ground and falling - snap to ground for smooth landing
          player.position.y = groundY;
          velocity.current.y = 0;
          isOnGround.current = true;

          // Reset horizontal velocity when landing and no input
          if (
            !move.current.forward &&
            !move.current.backward &&
            !move.current.left &&
            !move.current.right
          ) {
            velocity.current.x = 0;
            velocity.current.z = 0;
          }
        } else {
          // Player is in air (above ground threshold or moving upward)
          isOnGround.current = false;
        }
      } else {
        // Out of bounds - always falling, no ground collision
        isOnGround.current = false;
      }

      // Camera is a child of player, offset upward by eye height
      // Player position represents feet/ground level, camera is at eye level
      cam.position.set(0, playerConfig.eyeHeight, 0);
    };

    step();
  }, [cameraRef, playerRef, terrainConfigRef]);
}
