import { useEffect, useRef } from "react";
import * as THREE from "three";

import createScene from "../world/scene/createScene.js";
import { createCameraRig } from "./cameraRig.js";
import useFirstPersonControls from "./useFirstPersonControls.js";
import { updateTerrainGeometry } from "../world/terrain/createTerrain.js";
import { createFlockingMotes } from "../world/flocking/createFlockingMotes.js";
import { createPlant } from "../world/plants/createPlant.js";
import { createBuilding } from "../world/buildings/createBuilding.js";
import { createFlowers } from "../world/flowers/createFlowers.js";
import { createNPC, updateNPCs } from "../world/npcs/createNPC.js";
import { createPostProcessing } from "../engine/createPostProcessing.js";

import { sampleTerrainHeight } from "../world/terrain/sampleHeight.js";
import { analyzeTerrainComposition } from "../world/terrain/analyzeTerrainComposition.js";

export default function PlayerView({ isAuthorMode, terrainConfig, flockingConfig, plantConfigs = [], buildingConfigs = [], flowerConfigs = [], npcConfigs = [], onPlayerDataUpdate, onConsoleMessage }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const terrainRef = useRef(null);
  const sceneRef = useRef(null);
  const skyRef = useRef(null);
  const waterRef = useRef(null);
  const postProcessingRef = useRef(null);

  const flockingSystemRef = useRef(null);

  const plantRefs = useRef([]);

  const buildingRefs = useRef([]);

  const flowerRefs = useRef([]);

  const npcRefs = useRef([]);
  const dialogueRef = useRef(null);
  const playerDataRef = useRef({ position: { x: 0, y: 0, z: 0 }, terrainHeight: 0 });
  const lastPlayerDataUpdateRef = useRef(0);
  const onPlayerDataUpdateRef = useRef(onPlayerDataUpdate);
  const onConsoleMessageRef = useRef(onConsoleMessage);
  const consoleMessagesRef = useRef([]);
  const lastDialogueRef = useRef("");
  const lastCompositionUpdateRef = useRef(0);

  const isAuthorModeRef = useRef(isAuthorMode);
  useEffect(() => {
    isAuthorModeRef.current = isAuthorMode;
  }, [isAuthorMode]);

  // Keep callback refs up to date
  useEffect(() => {
    onPlayerDataUpdateRef.current = onPlayerDataUpdate;
  }, [onPlayerDataUpdate]);

  useEffect(() => {
    onConsoleMessageRef.current = onConsoleMessage;
  }, [onConsoleMessage]);

  const terrainConfigRef = useRef(null);
  useEffect(() => {
    terrainConfigRef.current = terrainConfig;
  }, [terrainConfig]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const { scene, camera, renderer, water, terrain, sky } = createScene(mount, terrainConfig);

    sceneRef.current = scene;
    cameraRef.current = camera;
    terrainRef.current = terrain;
    skyRef.current = sky;
    waterRef.current = water;
    
    // Create post-processing pipeline
    const postProcessing = createPostProcessing(renderer, scene, camera);
    postProcessingRef.current = postProcessing;
    
    // Calculate initial terrain composition and set sky immediately
    // Use setTimeout to ensure terrain geometry is fully initialized
    setTimeout(() => {
      if (sky?.material?.uniforms?.terrainComposition && terrain) {
        const waterHeight = terrainConfig?.waterHeight ?? 20;
        const initialComposition = analyzeTerrainComposition(terrain, waterHeight);
        sky.material.uniforms.terrainComposition.value = initialComposition;
      }
    }, 50);

    const player = createCameraRig(camera);
    playerRef.current = player;
    scene.add(player);

    // Initial player data update
    if (onPlayerDataUpdateRef.current && player) {
      const position = player.position;
      const initialData = {
        position: {
          x: position.x.toFixed(1),
          y: position.y.toFixed(1),
          z: position.z.toFixed(1),
        },
        terrainHeight: position.y.toFixed(1),
      };
      onPlayerDataUpdateRef.current(initialData);
    }

    // Initialize console (make it visible from the start)
    if (onConsoleMessageRef.current) {
      onConsoleMessageRef.current([]);
    }

    let lastTime = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const time = performance.now() / 1000;

      // Update player controls (movement, camera, physics)
      if (playerControlsUpdateRef.current) {
        playerControlsUpdateRef.current(deltaTime);
      }

      const now = performance.now();
      if (playerRef.current && (now - lastPlayerDataUpdateRef.current > 100)) {
        const position = playerRef.current.position;
        let terrainHeight = 0;

        if (terrainConfigRef.current) {
          try {
            terrainHeight = sampleTerrainHeight(position.x, position.z, terrainConfigRef.current);
          } catch (e) {
            terrainHeight = position.y;
          }
        } else {
          terrainHeight = position.y;
        }

        const newPlayerData = {
          position: {
            x: position.x.toFixed(1),
            y: position.y.toFixed(1),
            z: position.z.toFixed(1),
          },
          terrainHeight: terrainHeight.toFixed(1),
        };
        playerDataRef.current = newPlayerData;
        lastPlayerDataUpdateRef.current = now;
        if (onPlayerDataUpdateRef.current) {
          onPlayerDataUpdateRef.current(newPlayerData);
        }
      }

      if (!isAuthorModeRef.current) {
        if (water?.material?.uniforms?.time) {
          water.material.uniforms.time.value = time;
        }
        if (skyRef.current?.material?.uniforms?.time) {
          skyRef.current.material.uniforms.time.value = time;
        }
        if (terrain?.material?.uniforms?.time) {
          terrain.material.uniforms.time.value = time;
        }

        if (skyRef.current?.material?.uniforms?.terrainComposition && terrainRef.current) {
          const now = performance.now();
          if (now - lastCompositionUpdateRef.current > 2000) {
            const waterHeight = terrainConfigRef.current?.waterHeight ?? 20;
            const composition = analyzeTerrainComposition(terrainRef.current, waterHeight);
            skyRef.current.material.uniforms.terrainComposition.value = composition;
            lastCompositionUpdateRef.current = now;
          }
        }
      }

      if (flockingSystemRef.current) {
        flockingSystemRef.current.update(deltaTime, terrainConfigRef.current, buildingRefs.current);
      }

      if (npcRefs.current.length > 0 && playerRef.current && cameraRef.current) {
        const playerPosition = playerRef.current.position;
        updateNPCs(npcRefs.current, deltaTime, playerPosition, terrainConfigRef.current, time);

        let nearbyNPC = null;
        for (let i = 0; i < npcRefs.current.length; i++) {
          const npcRef = npcRefs.current[i];
          if (npcRef?.group?.userData?.dialogue && npcRef.group.userData.dialogue.length > 0) {
            nearbyNPC = npcRef;
            break;
          }
        }

        if (nearbyNPC && nearbyNPC.group) {
          const dialogue = nearbyNPC.group.userData.dialogue;

          if (dialogue !== lastDialogueRef.current && dialogue.length > 0) {
            lastDialogueRef.current = dialogue;
            const formattedDialogue = `"${dialogue}"`;
            consoleMessagesRef.current = [formattedDialogue];

            if (onConsoleMessageRef.current) {
              onConsoleMessageRef.current([...consoleMessagesRef.current]);
            }
          }
        } else {
          if (lastDialogueRef.current !== "") {
            lastDialogueRef.current = "";
            consoleMessagesRef.current = [];

            if (onConsoleMessageRef.current) {
              onConsoleMessageRef.current([]);
            }
          }
        }
      }

      // Use post-processing composer instead of direct render
      if (postProcessingRef.current?.composer) {
        postProcessingRef.current.composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      // Clean up post-processing
      if (postProcessingRef.current?.dispose) {
        postProcessingRef.current.dispose();
        postProcessingRef.current = null;
      }
      
      if (renderer?.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const playerControlsUpdateRef = useFirstPersonControls(
    playerRef,
    cameraRef,
    isAuthorModeRef,
    terrainConfigRef
  );

  useEffect(() => {
    if (!terrainConfig || !terrainRef.current) return;
    updateTerrainGeometry(terrainRef.current, terrainConfig);
    
    // Update water height if it changed
    const waterHeight = terrainConfig.waterHeight ?? 0;
    if (waterRef.current) {
      waterRef.current.position.y = waterHeight;
    }
    
    // Update terrain material waterHeight uniform
    if (terrainRef.current?.material?.uniforms?.waterHeight) {
      terrainRef.current.material.uniforms.waterHeight.value = waterHeight;
    }
    
    // Update sky composition after terrain geometry changes
    if (skyRef.current?.material?.uniforms?.terrainComposition && terrainRef.current) {
      setTimeout(() => {
        const composition = analyzeTerrainComposition(terrainRef.current, waterHeight);
        skyRef.current.material.uniforms.terrainComposition.value = composition;
      }, 100); // Small delay to ensure geometry is updated
    }
  }, [terrainConfig]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (flockingSystemRef.current) {
      flockingSystemRef.current.dispose();
      flockingSystemRef.current = null;
    }

    if (flockingConfig) {
      const system = createFlockingMotes(flockingConfig, scene, terrainConfigRef.current, buildingRefs.current);
      flockingSystemRef.current = system;
    }

    return () => {
      if (flockingSystemRef.current) {
        flockingSystemRef.current.dispose();
        flockingSystemRef.current = null;
      }
    };
  }, [flockingConfig]);

  useEffect(() => {
    if (flockingSystemRef.current && flockingConfig) {
      flockingSystemRef.current.updateConfig(flockingConfig);
    }
  }, [flockingConfig]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    plantRefs.current.forEach((plant) => {
      if (plant && plant.dispose) {
        plant.dispose();
      }
    });
    plantRefs.current = [];

    plantConfigs.forEach((plantConfig) => {
      if (!plantConfig.lsystem) return;

      let terrainHeight = 0;
      if (terrainConfigRef.current) {
        terrainHeight = sampleTerrainHeight(plantConfig.positionX, plantConfig.positionZ, terrainConfigRef.current);
      }

      const adjustedConfig = {
        ...plantConfig,
        positionY: terrainHeight,
      };

      const plant = createPlant(adjustedConfig, scene);
      if (plant) {
        plantRefs.current.push(plant);
      }
    });

    return () => {
      plantRefs.current.forEach((plant) => {
        if (plant && plant.dispose) {
          plant.dispose();
        }
      });
      plantRefs.current = [];
    };
  }, [plantConfigs]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    buildingRefs.current.forEach((building) => {
      if (building && building.dispose) {
        building.dispose();
      }
    });
    buildingRefs.current = [];

    buildingConfigs.forEach((buildingConfig) => {
      if (!buildingConfig.grammar) return;

      let terrainHeight = 0;
      if (terrainConfigRef.current) {
        terrainHeight = sampleTerrainHeight(buildingConfig.positionX, buildingConfig.positionZ, terrainConfigRef.current);
      }

      const adjustedConfig = {
        ...buildingConfig,
        positionX: buildingConfig.positionX,
        positionY: terrainHeight,
        positionZ: buildingConfig.positionZ,
      };

      const building = createBuilding(adjustedConfig, scene);
      if (building) {
        buildingRefs.current.push(building);
      }
    });

    // Invalidate building collision cache in flocking system
    if (flockingSystemRef.current?.invalidateBuildingCache) {
      flockingSystemRef.current.invalidateBuildingCache();
    }

    return () => {
      buildingRefs.current.forEach((building) => {
        if (building && building.dispose) {
          building.dispose();
        }
      });
      buildingRefs.current = [];
    };
  }, [buildingConfigs]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    flowerRefs.current.forEach((flower) => {
      if (flower && flower.dispose) {
        flower.dispose();
      }
    });
    flowerRefs.current = [];

    flowerConfigs.forEach((flowerConfig) => {
      const terrainConfigForFlowers = terrainConfigRef.current || null;

      const flower = createFlowers(flowerConfig, scene, terrainConfigForFlowers);
      if (flower) {
        flowerRefs.current.push(flower);
      }
    });

    return () => {
      flowerRefs.current.forEach((flower) => {
        if (flower && flower.dispose) {
          flower.dispose();
        }
      });
      flowerRefs.current = [];
    };
  }, [flowerConfigs]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up existing NPCs
    npcRefs.current.forEach(({ group }) => {
      if (group && group.parent) {
        group.parent.remove(group);
      }
    });
    npcRefs.current = [];

    // Create new NPCs
    const terrainConfigForNPCs = terrainConfigRef.current || null;
    npcConfigs.forEach((npcConfig) => {
      const npc = createNPC(npcConfig, scene, terrainConfigForNPCs);
      if (npc) {
        npcRefs.current.push(npc);
      }
    });

    return () => {
      npcRefs.current.forEach(({ group }) => {
        if (group && group.parent) {
          group.parent.remove(group);
        }
      });
      npcRefs.current = [];
    };
  }, [npcConfigs]);

  const handleClick = () => {
    if (!isAuthorModeRef.current) {
      document.body.requestPointerLock();
    }
  };

  return (
    <>
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
    </>
  );
}
