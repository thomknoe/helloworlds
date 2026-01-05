import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";
import { playerConfig } from "./playerConfig.js";
import { defaultTerrainConfig } from "../world/terrain/terrainConfig.js";
const defaultPerlinConfig = {
  type: "perlinNoise",
  seed: 42,
  noiseScale: defaultTerrainConfig.noiseScale, 
  octaves: 4,
  persistence: 0.5,
  amplitude: defaultTerrainConfig.amplitude, 
  frequency: 1,
};
const FALL_TELEPORT_TIME = 10000;
const FALL_TELEPORT_DEPTH = -1000;
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
  const jumpVelocity = 0.3;
  const gravity = 0.01;
  const groundThreshold = 0.1;
  const airControlFactor = 0.8;
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
        e.preventDefault();
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
  const updatePlayerControlsRef = useRef(null);
  const initializedRef = useRef(false);
  useEffect(() => {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const updatePlayerControls = (deltaTime) => {
      const player = playerRef.current;
      const cam = cameraRef.current;
      if (!player || !cam) return;
      if (!initializedRef.current) {
        const cfg = terrainConfigRef?.current || defaultPerlinConfig;
        const groundY = sampleTerrainHeight(
          player.position.x,
          player.position.z,
          cfg
        );
        player.position.y = groundY;
        isOnGround.current = true;
        initializedRef.current = true;
      }
      cam.rotation.order = "YXZ";
      cam.rotation.y = yaw.current;
      cam.rotation.x = pitch.current;
      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, up).normalize();
      let forwardAmount = 0;
      let rightAmount = 0;
      if (move.current.forward) forwardAmount += speed;
      if (move.current.backward) forwardAmount -= speed;
      if (move.current.left) rightAmount -= speed;
      if (move.current.right) rightAmount += speed;
      if (isOnGround.current) {
        velocity.current.x = forwardAmount * forward.x + rightAmount * right.x;
        velocity.current.z = forwardAmount * forward.z + rightAmount * right.z;
      } else {
        const desiredX = forwardAmount * forward.x + rightAmount * right.x;
        const desiredZ = forwardAmount * forward.z + rightAmount * right.z;
        velocity.current.x = THREE.MathUtils.lerp(
          velocity.current.x,
          desiredX,
          airControlFactor
        );
        velocity.current.z = THREE.MathUtils.lerp(
          velocity.current.z,
          desiredZ,
          airControlFactor
        );
      }
      velocity.current.y -= gravity;
      const terrainCfg = terrainConfigRef?.current;
      const terrainWidth = terrainCfg?.width || defaultTerrainConfig.width;
      const terrainDepth = terrainCfg?.depth || defaultTerrainConfig.depth;
      const halfWidth = terrainWidth / 2;
      const halfDepth = terrainDepth / 2;
      const wasOutOfBounds = isOutOfBounds.current;
      isOutOfBounds.current =
        player.position.x < -halfWidth ||
        player.position.x > halfWidth ||
        player.position.z < -halfDepth ||
        player.position.z > halfDepth;
      if (isOutOfBounds.current && !wasOutOfBounds) {
        fallStartTime.current = performance.now();
      }
      if (!isOutOfBounds.current && wasOutOfBounds) {
        fallStartTime.current = null;
      }
      player.position.x += velocity.current.x;
      player.position.y += velocity.current.y;
      player.position.z += velocity.current.z;
      if (isOutOfBounds.current) {
        const fallDuration = fallStartTime.current
          ? performance.now() - fallStartTime.current
          : 0;
        if (
          fallDuration >= FALL_TELEPORT_TIME ||
          player.position.y <= FALL_TELEPORT_DEPTH
        ) {
          const cfg = terrainConfigRef?.current || defaultPerlinConfig;
          const centerGroundY = sampleTerrainHeight(0, 0, cfg);
          player.position.set(0, centerGroundY, 0);
          velocity.current.set(0, 0, 0);
          isOnGround.current = true;
          isOutOfBounds.current = false;
          fallStartTime.current = null;
          cam.position.set(0, playerConfig.eyeHeight, 0);
          return;
        }
      }
      const cfg = terrainConfigRef?.current || defaultPerlinConfig;
      let groundY;
      if (isOutOfBounds.current) {
        groundY = FALL_TELEPORT_DEPTH - 100;
      } else {
        groundY = sampleTerrainHeight(
          player.position.x,
          player.position.z,
          cfg
        );
      }
      const distanceFromGround = player.position.y - groundY;
      if (!isOutOfBounds.current) {
        if (player.position.y <= groundY) {
          player.position.y = groundY;
          velocity.current.y = 0;
          isOnGround.current = true;
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
          player.position.y = groundY;
          velocity.current.y = 0;
          isOnGround.current = true;
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
          isOnGround.current = false;
        }
      } else {
        isOnGround.current = false;
      }
      cam.position.set(0, playerConfig.eyeHeight, 0);
    };
    updatePlayerControlsRef.current = updatePlayerControls;
    return () => {
      updatePlayerControlsRef.current = null;
      initializedRef.current = false;
    };
  }, [cameraRef, playerRef, terrainConfigRef]);
  return updatePlayerControlsRef;
}
