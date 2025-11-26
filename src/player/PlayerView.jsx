// src/player/PlayerView.jsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import createScene from "../world/scene/createScene.js";
import { createCameraRig } from "./cameraRig.js";
import useFirstPersonControls from "./useFirstPersonControls.js";
import { updateTerrainGeometry } from "../world/terrain/createTerrain.js";

import { getTerrainHeight } from "../algorithms/heightSampling.js";

export default function PlayerView({ isAuthorMode, terrainConfig, npcConfigs = [] }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const terrainRef = useRef(null);
  const sceneRef = useRef(null);

  // active NPC meshes
  const npcRefs = useRef([]);

  // center-screen dialogue panel
  const [activeDialogue, setActiveDialogue] = useState(null); 
  // shape: { npcId, text }

  // ----------------------------------------
  // AUTHOR MODE TRACKER
  // ----------------------------------------
  const isAuthorModeRef = useRef(isAuthorMode);
  useEffect(() => {
    isAuthorModeRef.current = isAuthorMode;
  }, [isAuthorMode]);

  // ----------------------------------------
  // TERRAIN CONFIG TRACKER
  // ----------------------------------------
  const terrainConfigRef = useRef(null);
  useEffect(() => {
    terrainConfigRef.current = terrainConfig;
  }, [terrainConfig]);

  // ----------------------------------------
  // INIT SCENE
  // ----------------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const { scene, camera, renderer, water, terrain } = createScene(mount);

    sceneRef.current = scene;
    cameraRef.current = camera;
    terrainRef.current = terrain;

    const player = createCameraRig(camera);
    playerRef.current = player;
    scene.add(player);

    // ----------------------------------------
    // ANIMATION LOOP
    // ----------------------------------------
    const animate = () => {
      requestAnimationFrame(animate);

      // animate water only outside author mode
      if (!isAuthorModeRef.current && water?.material?.uniforms?.time) {
        water.material.uniforms.time.value = performance.now() / 1000;
      }

      // billboard NPC labels
      npcRefs.current.forEach((npc) => {
        const label = npc.children[0];
        if (label) label.lookAt(camera.position);
      });

      // ----------------------------------------
      // PROXIMITY DETECTION
      // ----------------------------------------
      if (npcRefs.current.length > 0 && playerRef.current) {
        let closest = null;
        let closestDist = Infinity;

        const playerPos = playerRef.current.position;

        npcRefs.current.forEach((mesh) => {
          const dist = mesh.position.distanceTo(playerPos);
          if (dist < closestDist) {
            closestDist = dist;
            closest = mesh;
          }
        });

        const NEAR = 3.5;
        const FAR = 4.5;

        if (closestDist < NEAR) {
          // when entering range, activate dialogue panel (empty)
          if (!activeDialogue) {
            setActiveDialogue({ npcId: closest.userData.npcId, text: null });
          }
        } else if (closestDist > FAR) {
          // when leaving range, clear dialogue panel
          if (activeDialogue !== null) {
            setActiveDialogue(null);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (renderer?.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ----------------------------------------
  // FPS + Ground Following
  // ----------------------------------------
  useFirstPersonControls(
    playerRef,
    cameraRef,
    isAuthorModeRef,
    terrainConfigRef
  );

  // ----------------------------------------
  // UPDATE TERRAIN GEOMETRY
  // ----------------------------------------
  useEffect(() => {
    if (!terrainConfig || !terrainRef.current) return;
    updateTerrainGeometry(terrainRef.current, terrainConfig);
  }, [terrainConfig]);

  // ----------------------------------------
  // CREATE LABEL SPRITE
  // ----------------------------------------
  function createLabelSprite(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px sans-serif";
    ctx.fillText(text, 10, 70);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      depthTest: false,
      transparent: true
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2, 1, 1);
    return sprite;
  }

  // ----------------------------------------
  // SPAWN NPCS WHEN CONFIG CHANGES
  // ----------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    const player = playerRef.current;
    const camera = cameraRef.current;
    if (!scene || !player || !camera) return;

    // remove old NPCs
    npcRefs.current.forEach((npc) => scene.remove(npc));
    npcRefs.current = [];

    const loader = new STLLoader();

    npcConfigs.forEach((npc) => {
      if (!npc.modelFile) return;

      loader.load(
        URL.createObjectURL(npc.modelFile),
        (geometry) => {
          const mat = new THREE.MeshStandardMaterial({ color: 0xffd8a8 });
          const mesh = new THREE.Mesh(geometry, mat);

          // place NPC directly in front of player
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyQuaternion(player.quaternion);

          const spawn = new THREE.Vector3()
            .copy(player.position)
            .add(forward.multiplyScalar(4));

          const y = getTerrainHeight(spawn.x, spawn.z);
          mesh.position.set(spawn.x, y + 1.0, spawn.z);
          mesh.scale.setScalar(0.6);
          mesh.userData.npcId = npc.id;

          // name label
          const label = createLabelSprite(npc.name || "NPC");
          label.position.set(0, 2.2, 0);
          mesh.add(label);

          scene.add(mesh);
          npcRefs.current.push(mesh);
        }
      );
    });
  }, [npcConfigs]);

  // ----------------------------------------
  // NPC DIALOGUE (SPACE KEY)
  // ----------------------------------------
  useEffect(() => {
    const handleSpace = async (e) => {
      if (e.code !== "Space") return;

      if (!activeDialogue || !activeDialogue.npcId) return;

      const npc = npcConfigs.find((n) => n.id === activeDialogue.npcId);
      if (!npc) return;

      if (!npc.apiKey || npc.apiKey.trim() === "") {
        setActiveDialogue({ npcId: npc.id, text: "(No API key provided.)" });
        return;
      }

      // show placeholder
      setActiveDialogue({ npcId: npc.id, text: "…" });

      try {
        const reply = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${npc.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a character in a procedurally generated world. "
                  + "you are aware of your status as a 3-D model and you're very aware your existence. "
                  + "Be creative, humorous, and concise."
              },
              { role: "user", content: "Introduce yourself." }
            ]
          })
        }).then(r => r.json());

        const text = reply?.choices?.[0]?.message?.content || "…";

        setActiveDialogue({ npcId: npc.id, text });

      } catch (err) {
        console.error(err);
        setActiveDialogue({ npcId: npc.id, text: "(Error.)" });
      }
    };

    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [activeDialogue, npcConfigs]);

  // ----------------------------------------
  // POINTER LOCK
  // ----------------------------------------
  const handleClick = () => {
    if (!isAuthorModeRef.current) {
      document.body.requestPointerLock();
    }
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <>
      {/* THREEJS WORLD */}
      <div
        ref={mountRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          inset: 0,
          zIndex: 1
        }}
        onClick={handleClick}
      />

      {/* CENTER SCREEN DIALOGUE UI */}
      {activeDialogue?.text && (
        <div className="npc-dialogue-overlay">
          <div className="npc-dialogue-box">
            {activeDialogue.text}
          </div>
        </div>
      )}
    </>
  );
}
